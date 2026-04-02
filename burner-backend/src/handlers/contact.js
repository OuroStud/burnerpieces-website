/**
 * POST /api/contact
 *
 * Flow:
 *  1. Save submission to Cloudflare D1 (permanent record)
 *  2. Create a Lead in Zoho CRM (for tracking & reply)
 *  3. Forward email to admin via Zoho Mail
 *
 * Body: { name, email, phone?, subject?, message }
 */

import { createCRMLead }                          from '../services/zohoCRM.js';
import { sendEmail }                              from '../services/email.js';
import { jsonResponse, errorResponse }            from '../utils/helpers.js';

const ADMIN_EMAIL = 'hello@burnerpieces.com';

export async function handleContact(request, env) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400, request); }

  const { name, email, phone = '', subject = 'Website Enquiry', message } = body;

  if (!name || !email || !message) {
    return errorResponse('name, email, and message are required', 400, request);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email address', 400, request);
  }

  // 1. Save to D1 (permanent archive — never lost even if CRM fails)
  await env.DB.prepare(`
    INSERT INTO contact_submissions (name, email, phone, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(name, email, phone, subject, message, new Date().toISOString()).run();

  // 2. Create Lead in Zoho CRM (non-blocking — won't fail the API response)
  try {
    await createCRMLead(env, { name, email, phone, subject, message });
  } catch (e) {
    console.error('Zoho CRM lead creation failed (non-fatal):', e.message);
  }

  // 3. Forward to admin email
  try {
    await sendEmail(env, {
      to:       ADMIN_EMAIL,
      subject:  `[Contact] ${subject} – ${name}`,
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:560px;">
          <h2 style="color:#111;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Name</td><td style="padding:8px;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Subject</td><td style="padding:8px;">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-left:3px solid #111;">
            <p style="margin:0;white-space:pre-wrap;">${message.replace(/</g, '&lt;')}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#888;">
            This lead has also been created in Zoho CRM → Leads.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Admin email failed (non-fatal):', e.message);
  }

  return jsonResponse({ success: true, message: "Message received. We'll be in touch within 24 hours!" }, 200, request);
}
