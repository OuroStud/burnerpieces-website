/**
 * Zoho Mail – transactional email via Zoho Mail API
 * Docs: https://www.zoho.com/mail/help/api/
 *
 * Required env secrets:
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *   ZOHO_FROM_EMAIL  (e.g. hello@burnerpieces.com)
 *   ZOHO_ACCOUNT_ID  (numeric ID from Zoho Mail account)
 */

const ZOHO_TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token';
const ZOHO_MAIL_API  = 'https://mail.zoho.in/api/accounts';

/** Exchange refresh token for short-lived access token */
async function getZohoAccessToken(env) {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN,
  });

  const res  = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

/**
 * Send an email via Zoho Mail API
 * @param {object} env - Worker bindings
 * @param {object} opts - { to, subject, htmlBody, attachments: [{filename, base64, mimeType}] }
 */
export async function sendEmail(env, { to, subject, htmlBody, attachments = [] }) {
  const token = await getZohoAccessToken(env);

  const payload = {
    fromAddress: env.ZOHO_FROM_EMAIL,
    toAddress:   to,
    subject,
    content:     htmlBody,
    mailFormat:  'html',
  };

  if (attachments.length > 0) {
    payload.attachments = attachments.map(a => ({
      name:    a.filename,
      content: a.base64,
      type:    a.mimeType || 'application/pdf',
    }));
  }

  const url = `${ZOHO_MAIL_API}/${env.ZOHO_ACCOUNT_ID}/messages`;
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Zoho Mail error: ${JSON.stringify(data)}`);
  return data;
}

/** Render the customer-facing order confirmation HTML body */
export function orderConfirmationEmail(order, invoiceNumber) {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <div style="background:#111;padding:24px 32px;">
        <h1 style="color:#fff;font-size:22px;letter-spacing:3px;margin:0;text-transform:uppercase;">
          Burner Pieces 🔥
        </h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin-bottom:8px;">Order Confirmed</h2>
        <p style="color:#555;margin-bottom:24px;">
          Thanks for your order! We're getting it ready to ship.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 12px;font-weight:600;">Order ID</td>
            <td style="padding:8px 12px;">${order.orderId}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;">Invoice No.</td>
            <td style="padding:8px 12px;">${invoiceNumber}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 12px;font-weight:600;">Amount Paid</td>
            <td style="padding:8px 12px;">₹${(order.amount / 100).toFixed(2)}</td>
          </tr>
        </table>

        <p style="color:#555;font-size:13px;">
          Your GST invoice is attached. For any questions, reply to this email or reach us at
          <a href="mailto:hello@burnerpieces.com">hello@burnerpieces.com</a>.
        </p>
      </div>
      <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;text-align:center;">
        Ouro Studio Private Limited &nbsp;|&nbsp; burnerpieces.com
      </div>
    </div>`;
}
