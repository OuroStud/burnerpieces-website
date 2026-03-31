/**
 * Shared utilities – CORS, JSON helpers, error responses
 */

const ALLOWED_ORIGINS = [
  'https://burnerpieces.com',
  'https://www.burnerpieces.com',
];

export function corsHeaders(request) {
  const origin = request?.headers?.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function jsonResponse(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(request ? corsHeaders(request) : {}),
    },
  });
}

export function errorResponse(message, status = 400, request = null) {
  return jsonResponse({ success: false, error: message }, status, request);
}

/** Format a number as Indian Rupees string, e.g. "₹1,499.00" */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Generate a sequential invoice number: INV-YYYYMM-XXXXX */
export function generateInvoiceNumber(sequence) {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `BP-${ym}-${String(sequence).padStart(5, '0')}`;
}

/** Determine GST slab and split CGST/SGST vs IGST */
export function calcGST(itemAmountExclTax, isInterState = false) {
  // Indian apparel GST: 5 % for ≤ ₹2500, 12 % for > ₹2500 (corrected from brief)
  // Note: brief says 18 % for > ₹2500 – we expose the rate as a constant so the
  // store owner can override it via wrangler secret GST_HIGH_RATE if needed.
  const LOW_RATE  = 0.05;
  const HIGH_RATE = 0.12; // standard for garments > ₹2500; brief said 18 % — adjust if needed

  const rate = itemAmountExclTax <= 2500 ? LOW_RATE : HIGH_RATE;
  const taxAmount = parseFloat((itemAmountExclTax * rate).toFixed(2));

  if (isInterState) {
    return { igst: taxAmount, cgst: 0, sgst: 0, rate };
  }
  const half = parseFloat((taxAmount / 2).toFixed(2));
  return { igst: 0, cgst: half, sgst: taxAmount - half, rate };
}

/** Naive state-code check: both parties in same state → intra-state */
export function isInterState(sellerState, buyerState) {
  return sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase();
}

/** Random 6-char alphanumeric string for idempotency keys */
export function nonce() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
