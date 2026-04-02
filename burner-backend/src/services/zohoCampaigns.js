/**
 * Zoho Campaigns Service
 * Adds newsletter subscribers directly to a Zoho Campaigns mailing list.
 * This replaces the D1 database insert for newsletter signups.
 *
 * Required env secrets:
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *   ZOHO_CAMPAIGNS_LIST_KEY  — the "List Key" from your Campaigns mailing list
 *
 * HOW TO FIND YOUR LIST KEY:
 *   1. Log into Zoho Campaigns (campaigns.zoho.in)
 *   2. Go to Contacts → Mailing Lists
 *   3. Click on your list → Settings
 *   4. Copy the "List Key" (looks like: 2zbe59a6ebXXXXXXXX)
 */

const ZOHO_TOKEN_URL      = 'https://accounts.zoho.in/oauth/v2/token';
const ZOHO_CAMPAIGNS_BASE = 'https://campaigns.zoho.in/api/v1.1';

async function getCampaignsToken(env) {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN,
  });
  const res  = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho Campaigns token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

/**
 * Add a subscriber to your Zoho Campaigns mailing list.
 * If the email already exists it will be updated (not duplicated).
 *
 * @param {object} env
 * @param {object} subscriber  { email, name }
 */
export async function addCampaignsSubscriber(env, subscriber) {
  const token   = await getCampaignsToken(env);
  const listKey = env.ZOHO_CAMPAIGNS_LIST_KEY;
  if (!listKey) throw new Error('ZOHO_CAMPAIGNS_LIST_KEY secret is not set');

  // Zoho Campaigns uses form-encoded bodies for this endpoint
  const contactInfo = JSON.stringify({
    'Contact Email': subscriber.email,
    'First Name':    (subscriber.name || '').split(' ')[0] || '',
    'Last Name':     (subscriber.name || '').split(' ').slice(1).join(' ') || '',
  });

  const body = new URLSearchParams({
    resfmt:         'JSON',
    listkey:        listKey,
    contactinfo:    contactInfo,
  });

  const res = await fetch(`${ZOHO_CAMPAIGNS_BASE}/json/listsubscribe`, {
    method:  'POST',
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await res.json();

  // Zoho Campaigns returns status in the body, not always HTTP error codes
  // "code":"success" means it worked; "code":"Already subscribed" is also OK
  if (data.status === 'error' && data.code !== 'Already subscribed') {
    throw new Error(`Zoho Campaigns subscribe failed: ${JSON.stringify(data)}`);
  }
  return data;
}
