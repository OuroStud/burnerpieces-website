/**
 * GET /api/orders
 * Simple admin endpoint – protected by a static secret header.
 * Header: X-Admin-Key: <ADMIN_SECRET>
 */

import { jsonResponse, errorResponse } from '../utils/helpers.js';

export async function handleOrders(request, env) {
  const key = request.headers.get('X-Admin-Key');
  if (!key || key !== env.ADMIN_SECRET) {
    return errorResponse('Unauthorized', 401, request);
  }

  const url    = new URL(request.url);
  const page   = parseInt(url.searchParams.get('page')  || '1', 10);
  const limit  = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const { results } = await env.DB.prepare(`
    SELECT id, razorpay_order_id, razorpay_payment_id, invoice_number,
           amount_paise, customer_name, customer_email, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  const countRow = await env.DB.prepare('SELECT COUNT(*) AS total FROM orders').first();

  return jsonResponse({
    success: true,
    page, limit,
    total: countRow.total,
    orders: results,
  }, 200, request);
}
