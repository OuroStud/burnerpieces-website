/**
 * POST /api/newsletter
 *
 * Body: { email, name? }
 */

import { sendEmail }                              from '../services/email.js';
import { jsonResponse, errorResponse }            from '../utils/helpers.js';

export async function handleNewsletter(request, env) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400, request); }

  const { email, name = '' } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Valid email required', 400, request);
  }

  // Upsert – ignore if already subscribed
  await env.DB.prepare(`
    INSERT INTO newsletter_subscribers (email, name, subscribed_at)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO NOTHING
  `).bind(email, name, new Date().toISOString()).run();

  // Welcome email
  try {
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
            <h2>You're in${name ? `, ${name.split(' ')[0]}` : ''}! 🙌</h2>
            <p style="color:#555;line-height:1.7;">
              Thanks for subscribing. You'll be the first to know about new drops,
              restocks, and exclusive offers.
            </p>
            <p style="margin-top:24px;font-size:12px;color:#999;">
              Don't want emails? <a href="https://burnerpieces.com/unsubscribe?e=${encodeURIComponent(email)}">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error('Newsletter welcome email failed (non-fatal):', e.message);
  }

  return jsonResponse({ success: true, message: 'Subscribed! Check your inbox.' }, 200, request);
}
