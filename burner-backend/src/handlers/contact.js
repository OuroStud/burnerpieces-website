/**
 * POST /api/contact
 *
 * Body: { name, email, phone?, subject?, message }
 */

import { sendEmail }                              from '../services/email.js';
import { jsonResponse, errorResponse, corsHeaders } from '../utils/helpers.js';

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

  // Save to D1
  await env.DB.prepare(`
    INSERT INTO contact_submissions (name, email, phone, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(name, email, phone, subject, message, new Date().toISOString()).run();

  // Forward to admin inbox
  try {
    await sendEmail(env, {
      to:       ADMIN_EMAIL,
      subject:  `[Contact] ${subject} – ${name}`,
      htmlBody: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
  } catch (e) {
    console.error('Contact email failed (non-fatal):', e.message);
  }

  return jsonResponse({ success: true, message: 'Message received. We\'ll be in touch!' }, 200, request);
}
