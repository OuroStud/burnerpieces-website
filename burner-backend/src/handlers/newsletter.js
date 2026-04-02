/**
 * POST /api/newsletter
 *
 * Flow:
 *  1. Save to Cloudflare D1 (permanent record)
 *  2. Add to Zoho Campaigns mailing list (for broadcasts & automation)
 *  3. Send welcome email via Zoho Mail
 *
 * Body: { email, name? }
 */

import { addCampaignsSubscriber }      from '../services/zohoCampaigns.js';
import { sendEmail }                   from '../services/email.js';
import { jsonResponse, errorResponse } from '../utils/helpers.js';

export async function handleNewsletter(request, env) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400, request); }

  const { email, name = '' } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Valid email required', 400, request);
  }

  // 1. Save to D1 (permanent record — survives even if Campaigns API changes)
  await env.DB.prepare(`
    INSERT INTO newsletter_subscribers (email, name, subscribed_at)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO NOTHING
  `).bind(email, name, new Date().toISOString()).run();

  // 2. Add to Zoho Campaigns mailing list (non-blocking)
  try {
    await addCampaignsSubscriber(env, { email, name });
  } catch (e) {
    console.error('Zoho Campaigns subscribe failed (non-fatal):', e.message);
    // Still return success — subscriber is saved in D1
  }

  // 3. Welcome email
  try {
    const firstName = name.split(' ')[0] || '';
    await sendEmail(env, {
      to:      email,
      subject: 'Welcome to Burner Pieces 🔥',
      htmlBody: `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#111;padding:20px 32px;">
            <h1 style="color:#fff;font-size:20px;letter-spacing:3px;margin:0;text-transform:uppercase;">
              Burner Pieces
            </h1>
          </div>
          <div style="padding:32px;">
            <h2>You're in${firstName ? `, ${firstName}` : ''}! 🙌</h2>
            <p style="color:#555;line-height:1.7;">
              Thanks for subscribing. You'll be the first to know about new drops,
              restocks, and exclusive offers.
            </p>
            <p style="margin-top:24px;font-size:12px;color:#999;">
              Don't want emails?
              <a href="https://burnerpieces.com/unsubscribe?e=${encodeURIComponent(email)}">Unsubscribe</a>
            </p>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;text-align:center;">
            Ouro Studio Private Limited &nbsp;|&nbsp; burnerpieces.com
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error('Welcome email failed (non-fatal):', e.message);
  }

  return jsonResponse({ success: true, message: 'Subscribed! Check your inbox.' }, 200, request);
}
