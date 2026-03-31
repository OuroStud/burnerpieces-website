/**
 * POST /api/payment/verify
 *
 * Flow:
 *  1. Verify Razorpay HMAC signature
 *  2. Insert order into D1
 *  3. Generate GST PDF invoice
 *  4. Push to Zoho Books
 *  5. Create Shiprocket shipment
 *  6. Email customer with invoice PDF attached
 *
 * Expected request body (JSON):
 * {
 *   razorpay_order_id:   string,
 *   razorpay_payment_id: string,
 *   razorpay_signature:  string,
 *   customer: {
 *     name, email, phone, address, city, state, pincode,
 *     country?, gstin?
 *   },
 *   items: [{ name, qty, unitPrice, sku?, hsn?, weight_kg? }],
 *   amount: number   // in paise
 * }
 */

import { verifyRazorpaySignature } from '../services/razorpay.js';
import { generateInvoicePDF }      from '../services/invoice.js';
import { pushInvoiceToZohoBooks }  from '../services/zohoBooks.js';
import { createShiprocketOrder }   from '../services/shiprocket.js';
import { sendEmail, orderConfirmationEmail } from '../services/email.js';
import { generateInvoiceNumber, jsonResponse, errorResponse, corsHeaders } from '../utils/helpers.js';

export async function handlePayment(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400, request);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, items, amount } = body;

  // ── 1. Validate inputs ─────────────────────────────────────────────────────
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return errorResponse('Missing Razorpay fields', 400, request);
  }
  if (!customer?.email || !customer?.name || !items?.length) {
    return errorResponse('Missing customer or items', 400, request);
  }

  // ── 2. Verify Razorpay signature ───────────────────────────────────────────
  const valid = await verifyRazorpaySignature(
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    env.RAZORPAY_KEY_SECRET,
  );
  if (!valid) {
    return errorResponse('Payment signature invalid', 403, request);
  }

  // ── 3. Idempotency – check if this payment was already processed ───────────
  const existing = await env.DB.prepare(
    'SELECT id FROM orders WHERE razorpay_payment_id = ?',
  ).bind(razorpay_payment_id).first();

  if (existing) {
    return jsonResponse({ success: true, message: 'Already processed', orderId: existing.id }, 200, request);
  }

  // ── 4. Generate invoice number (atomic via D1 sequence table) ──────────────
  await env.DB.prepare(
    'INSERT INTO invoice_sequence (placeholder) VALUES (1)',
  ).run();
  const seqRow = await env.DB.prepare(
    'SELECT last_insert_rowid() AS seq',
  ).first();
  const invoiceNumber = generateInvoiceNumber(seqRow.seq);

  const now         = new Date();
  const invoiceDate = now.toISOString().slice(0, 10);           // YYYY-MM-DD
  const orderDate   = now.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:mm

  // ── 5. Insert order into D1 ────────────────────────────────────────────────
  await env.DB.prepare(`
    INSERT INTO orders
      (razorpay_order_id, razorpay_payment_id, invoice_number, amount_paise,
       customer_name, customer_email, customer_phone, customer_address,
       customer_city, customer_state, customer_pincode, items_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    razorpay_order_id, razorpay_payment_id, invoiceNumber, amount,
    customer.name, customer.email, customer.phone || '',
    customer.address, customer.city, customer.state, customer.pincode,
    JSON.stringify(items), now.toISOString(),
  ).run();

  // ── Run async tasks in background (non-blocking for response) ─────────────
  ctx.waitUntil((async () => {
    try {
      // 6. Generate PDF invoice
      const invoiceParams = {
        invoiceNumber, invoiceDate,
        order: razorpay_order_id,
        customer,
        items,
      };
      const { pdfBase64, isFallbackHtml } = await generateInvoicePDF(invoiceParams, env);

      // 7. Push to Zoho Books
      try {
        await pushInvoiceToZohoBooks(env, {
          invoiceNumber, invoiceDate, customer, items,
          razorpayPaymentId: razorpay_payment_id,
        });
      } catch (e) {
        console.error('Zoho Books push failed (non-fatal):', e.message);
      }

      // 8. Create Shiprocket order
      try {
        await createShiprocketOrder(env, {
          orderId:       razorpay_order_id,
          orderDate,
          customer,
          items,
          paymentMethod: 'prepaid',
        });
      } catch (e) {
        console.error('Shiprocket order failed (non-fatal):', e.message);
      }

      // 9. Email customer
      const emailHtml = orderConfirmationEmail(
        { orderId: razorpay_order_id, amount },
        invoiceNumber,
      );

      await sendEmail(env, {
        to:       customer.email,
        subject:  `Your Burner Pieces Invoice – ${invoiceNumber}`,
        htmlBody: emailHtml,
        attachments: [{
          filename: `invoice-${invoiceNumber}.${isFallbackHtml ? 'html' : 'pdf'}`,
          base64:   pdfBase64,
          mimeType: isFallbackHtml ? 'text/html' : 'application/pdf',
        }],
      });

      // Update order status
      await env.DB.prepare(
        'UPDATE orders SET status = ?, invoice_sent_at = ? WHERE razorpay_payment_id = ?',
      ).bind('confirmed', now.toISOString(), razorpay_payment_id).run();

    } catch (e) {
      console.error('Background processing error:', e);
    }
  })());

  return jsonResponse(
    { success: true, invoiceNumber, message: 'Payment verified. Invoice will be emailed shortly.' },
    200,
    request,
  );
}
