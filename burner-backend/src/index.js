/**
 * Burner Pieces – Cloudflare Worker Entry Point
 * Ouro Studio Private Limited
 */

import { handlePayment } from './handlers/payment.js';
import { handleContact } from './handlers/contact.js';
import { handleNewsletter } from './handlers/newsletter.js';
import { handleOrders } from './handlers/orders.js';
import { corsHeaders, errorResponse } from './utils/helpers.js';

export default {
  async fetch(request, env, ctx) {
    // Global CORS pre-flight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const { pathname } = url;

    try {
      // ── Payment & Orders ──────────────────────────────────────────
      if (pathname === '/api/payment/verify'   && request.method === 'POST') return handlePayment(request, env, ctx);
      if (pathname === '/api/orders'           && request.method === 'GET')  return handleOrders(request, env);

      // ── Contact form ──────────────────────────────────────────────
      if (pathname === '/api/contact'          && request.method === 'POST') return handleContact(request, env);

      // ── Newsletter ────────────────────────────────────────────────
      if (pathname === '/api/newsletter'       && request.method === 'POST') return handleNewsletter(request, env);

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error('Unhandled error:', err);
      return errorResponse('Internal server error', 500);
    }
  },
};
