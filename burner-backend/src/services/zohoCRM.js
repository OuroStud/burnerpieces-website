/**
 * Zoho CRM Service
 * Creates a Lead in Zoho CRM for every contact form submission.
 * The lead appears in CRM → Leads, where you can track and reply.
 *
 * Required env secrets (same OAuth app as Zoho Mail/Books):
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 */

const ZOHO_TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token';
const ZOHO_CRM_BASE  = 'https://www.zohoapis.in/crm/v2';

async function getCRMToken(env) {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN,
  });
  const res  = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho CRM token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

/**
 * Create a Lead record in Zoho CRM from a contact form submission.
 *
 * @param {object} env
 * @param {object} contact  { name, email, phone, subject, message }
 */
export async function createCRMLead(env, contact) {
  const token = await getCRMToken(env);

  // Split name into first/last for CRM fields
  const nameParts  = (contact.name || '').trim().split(/\s+/);
  const firstName  = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'Unknown';
  const lastName   = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '-';

  const leadPayload = {
    data: [{
      First_Name:   firstName,
      Last_Name:    lastName,
      Email:        contact.email,
      Phone:        contact.phone || '',
      Lead_Source:  'Website Contact Form',
      Lead_Status:  'Not Contacted',
      // Store the enquiry subject in the Designation field (repurposed) or Description
      Description:  `Subject: ${contact.subject || 'Website Enquiry'}\n\n${contact.message || ''}`,
      Company:      'Direct Customer', // Required field in CRM
    }],
    trigger: ['workflow'],
  };

  const res = await fetch(`${ZOHO_CRM_BASE}/Leads`, {
    method:  'POST',
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadPayload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Zoho CRM lead creation failed: ${JSON.stringify(data)}`);
  return data;
}
