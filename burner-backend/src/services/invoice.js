/**
 * GST Invoice PDF generator
 *
 * Cloudflare Workers have no filesystem access and no Node built-ins,
 * so we build a clean HTML invoice and convert it to PDF via the
 * Cloudflare browser-rendering API (headless Chromium).
 *
 * If BROWSER_RENDERING is not bound (local dev), we fall back to returning
 * the HTML so the flow doesn't break.
 *
 * The returned value is always: { pdfBase64: string, html: string }
 */

import { calcGST, isInterState, formatINR } from '../utils/helpers.js';

const SELLER = {
  name: 'Ouro Studio Private Limited',
  brand: 'Burner Pieces',
  address: 'Mumbai, Maharashtra',  // ← update with full registered address
  gstin: 'YOUR_GSTIN_HERE',        // ← replace with actual GSTIN
  state: 'Maharashtra',
  stateCode: '27',
  pan: 'YOUR_PAN_HERE',
  email: 'hello@burnerpieces.com',
  website: 'www.burnerpieces.com',
};

export async function generateInvoicePDF(invoiceData, env) {
  const html = buildInvoiceHTML(invoiceData);

  // Cloudflare Browser Rendering (Workers binding: env.BROWSER)
  if (env.BROWSER) {
    try {
      const browser  = await env.BROWSER.fetch(new Request('https://pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, options: { format: 'A4', printBackground: true } }),
      }));
      const pdfBuffer = await browser.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
      return { pdfBase64, html };
    } catch (e) {
      console.warn('Browser rendering failed, returning HTML fallback:', e.message);
    }
  }

  // Fallback: encode the HTML itself so the email service can attach it
  const pdfBase64 = btoa(unescape(encodeURIComponent(html)));
  return { pdfBase64, html, isFallbackHtml: true };
}

function buildInvoiceHTML(d) {
  const {
    invoiceNumber, invoiceDate, order,
    customer,          // { name, email, phone, address, state, gstin? }
    items,             // [{ name, qty, unitPrice, hsn? }]
  } = d;

  const interState = isInterState(SELLER.state, customer.state);
  let subTotal = 0;
  let totalTax = 0;

  const rowsHtml = items.map((item, i) => {
    const lineTotal  = item.qty * item.unitPrice;
    const gst        = calcGST(item.unitPrice, interState);
    const taxLine    = parseFloat((lineTotal * gst.rate).toFixed(2));
    subTotal += lineTotal;
    totalTax += taxLine;

    const taxLabel = interState
      ? `IGST ${(gst.rate * 100).toFixed(0)}%`
      : `CGST ${(gst.rate * 50).toFixed(0)}% + SGST ${(gst.rate * 50).toFixed(0)}%`;

    return `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}${item.hsn ? `<br><small>HSN: ${item.hsn}</small>` : ''}</td>
        <td class="center">${item.qty}</td>
        <td class="right">${formatINR(item.unitPrice)}</td>
        <td class="right">${formatINR(lineTotal)}</td>
        <td class="center">${taxLabel}</td>
        <td class="right">${formatINR(taxLine)}</td>
      </tr>`;
  }).join('');

  // GST breakdown table
  const gstBreakdown = buildGSTBreakdown(items, interState);
  const grandTotal   = parseFloat((subTotal + totalTax).toFixed(2));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px;
         color: #1a1a1a; padding: 32px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start;
             border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
  .brand-sub { font-size: 10px; color: #555; margin-top: 2px; }
  .inv-title { font-size: 18px; font-weight: 700; text-align: right; }
  .inv-meta { text-align: right; margin-top: 4px; line-height: 1.6; color: #444; }
  .parties { display: flex; gap: 32px; margin-bottom: 20px; }
  .party { flex: 1; }
  .party h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
               color: #888; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 6px; }
  .party p  { line-height: 1.7; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #111; color: #fff; padding: 7px 8px; text-align: left; font-size: 10px;
       text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 7px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .right  { text-align: right; }
  .center { text-align: center; }
  .totals { margin-left: auto; width: 260px; }
  .totals tr td:first-child { color: #555; }
  .totals tr td:last-child { text-align: right; font-weight: 600; }
  .grand td { font-size: 13px; font-weight: 800; border-top: 2px solid #111 !important;
               padding-top: 10px; }
  .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 12px;
             font-size: 10px; color: #888; text-align: center; line-height: 1.8; }
  .badge { display: inline-block; background: #111; color: #fff; font-size: 9px;
            padding: 2px 8px; border-radius: 20px; letter-spacing: 1px;
            text-transform: uppercase; margin-bottom: 8px; }
  .gst-table td, .gst-table th { font-size: 10px; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div>
    <div class="brand">Burner Pieces</div>
    <div class="brand-sub">by Ouro Studio Private Limited</div>
    <div style="margin-top:8px;line-height:1.7;color:#444;">
      ${SELLER.address}<br>
      GSTIN: ${SELLER.gstin} &nbsp;|&nbsp; PAN: ${SELLER.pan}<br>
      State: ${SELLER.state} (${SELLER.stateCode})<br>
      ${SELLER.email} &nbsp;|&nbsp; ${SELLER.website}
    </div>
  </div>
  <div>
    <div class="inv-title">TAX INVOICE</div>
    <div class="inv-meta">
      Invoice No.: <strong>${invoiceNumber}</strong><br>
      Date: <strong>${invoiceDate}</strong><br>
      Order: <strong>${order}</strong>
    </div>
  </div>
</div>

<!-- Bill To / Ship To -->
<div class="parties">
  <div class="party">
    <h4>Bill To</h4>
    <p>
      <strong>${customer.name}</strong><br>
      ${customer.address}<br>
      State: ${customer.state}<br>
      ${customer.gstin ? `GSTIN: ${customer.gstin}<br>` : ''}
      ${customer.phone}<br>
      ${customer.email}
    </p>
  </div>
  <div class="party">
    <h4>Supply Type</h4>
    <p>
      ${interState ? '<span class="badge">Inter-State (IGST)</span>' : '<span class="badge">Intra-State (CGST+SGST)</span>'}<br><br>
      Place of Supply: ${customer.state}
    </p>
  </div>
</div>

<!-- Line Items -->
<table>
  <thead>
    <tr>
      <th>#</th><th>Item / HSN</th><th class="center">Qty</th>
      <th class="right">Unit Price</th><th class="right">Amount</th>
      <th class="center">Tax</th><th class="right">Tax Amt</th>
    </tr>
  </thead>
  <tbody>${rowsHtml}</tbody>
</table>

<!-- GST Breakdown -->
<table class="gst-table" style="width:55%;margin-left:auto;margin-bottom:16px;">
  <thead>
    <tr>
      <th>HSN/SAC</th><th>Taxable Value</th>
      ${interState ? '<th>IGST Rate</th><th>IGST Amt</th>' : '<th>CGST Rate</th><th>CGST Amt</th><th>SGST Rate</th><th>SGST Amt</th>'}
    </tr>
  </thead>
  <tbody>${gstBreakdown}</tbody>
</table>

<!-- Totals -->
<table class="totals">
  <tr><td>Sub Total</td><td>${formatINR(subTotal)}</td></tr>
  <tr><td>GST</td><td>${formatINR(totalTax)}</td></tr>
  <tr class="grand"><td>Grand Total</td><td>${formatINR(grandTotal)}</td></tr>
</table>

<!-- Footer -->
<div class="footer">
  <p>This is a computer-generated invoice and does not require a signature.</p>
  <p>Thank you for shopping at Burner Pieces &nbsp;🔥</p>
  <p style="margin-top:6px;">For queries: ${SELLER.email} &nbsp;|&nbsp; ${SELLER.website}</p>
</div>

</body>
</html>`;
}

function buildGSTBreakdown(items, interState) {
  // Group by HSN + rate
  const groups = {};
  for (const item of items) {
    const lineTotal = item.qty * item.unitPrice;
    const gst       = calcGST(item.unitPrice, interState);
    const key       = `${item.hsn || 'N/A'}_${gst.rate}`;
    if (!groups[key]) groups[key] = { hsn: item.hsn || 'N/A', taxable: 0, rate: gst.rate, tax: 0 };
    groups[key].taxable += lineTotal;
    groups[key].tax     += parseFloat((lineTotal * gst.rate).toFixed(2));
  }

  return Object.values(groups).map(g => {
    const rateDisplay = `${(g.rate * 100).toFixed(0)}%`;
    const half        = parseFloat((g.tax / 2).toFixed(2));
    return interState
      ? `<tr><td>${g.hsn}</td><td class="right">${formatINR(g.taxable)}</td>
           <td class="center">${rateDisplay}</td><td class="right">${formatINR(g.tax)}</td></tr>`
      : `<tr><td>${g.hsn}</td><td class="right">${formatINR(g.taxable)}</td>
           <td class="center">${(g.rate * 50).toFixed(0)}%</td><td class="right">${formatINR(half)}</td>
           <td class="center">${(g.rate * 50).toFixed(0)}%</td><td class="right">${formatINR(g.tax - half)}</td></tr>`;
  }).join('');
}
