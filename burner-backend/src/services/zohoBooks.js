/**
 * Zoho Books API – push invoice after successful payment
 * Docs: https://www.zoho.com/books/api/v3/
 *
 * Required env secrets:
 *   ZOHO_BOOKS_ORG_ID       – Organisation ID in Zoho Books
 *   ZOHO_CLIENT_ID          – same OAuth app as mail (or separate)
 *   ZOHO_CLIENT_SECRET
 *   ZOHO_REFRESH_TOKEN
 */

const ZOHO_TOKEN_URL  = 'https://accounts.zoho.in/oauth/v2/token';
const ZOHO_BOOKS_BASE = 'https://www.zohoapis.in/books/v3';

async function getBooksToken(env) {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN,
  });
  const res  = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho Books token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

/**
 * Find-or-create a contact in Zoho Books by email.
 * Returns the contact_id string.
 */
async function upsertContact(token, orgId, customer) {
  // Search by email
  const searchRes = await fetch(
    `${ZOHO_BOOKS_BASE}/contacts?email=${encodeURIComponent(customer.email)}&organization_id=${orgId}`,
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } },
  );
  const searchData = await searchRes.json();

  if (searchData.contacts && searchData.contacts.length > 0) {
    return searchData.contacts[0].contact_id;
  }

  // Create new contact
  const createRes = await fetch(
    `${ZOHO_BOOKS_BASE}/contacts?organization_id=${orgId}`,
    {
      method:  'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_name:   customer.name,
        contact_type:   'customer',
        email:          customer.email,
        phone:          customer.phone || '',
        billing_address: {
          address: customer.address,
          state:   customer.state,
          country: 'India',
        },
        gstin: customer.gstin || '',
      }),
    },
  );
  const createData = await createRes.json();
  if (!createData.contact) throw new Error(`Zoho Books create contact failed: ${JSON.stringify(createData)}`);
  return createData.contact.contact_id;
}

/**
 * Push a new invoice to Zoho Books and mark it as paid.
 * @param {object} env
 * @param {object} params
 *   invoiceNumber, invoiceDate, customer, items, razorpayPaymentId
 * @returns {object} zohoInvoice
 */
export async function pushInvoiceToZohoBooks(env, params) {
  const { invoiceNumber, invoiceDate, customer, items, razorpayPaymentId } = params;
  const orgId = env.ZOHO_BOOKS_ORG_ID;
  const token = await getBooksToken(env);

  const contactId = await upsertContact(token, orgId, customer);

  // Build line items
  const lineItems = items.map(item => ({
    name:         item.name,
    quantity:     item.qty,
    rate:         item.unitPrice,
    tax_name:     item.unitPrice <= 2500 ? 'GST5'  : 'GST12',
    tax_type:     'tax',
    hsn_or_sac:   item.hsn || '',
  }));

  const invoicePayload = {
    customer_id:     contactId,
    invoice_number:  invoiceNumber,
    date:            invoiceDate,           // YYYY-MM-DD
    payment_terms:   0,
    line_items:      lineItems,
    notes:           `Razorpay Payment ID: ${razorpayPaymentId}`,
    is_inclusive_tax: false,
  };

  // Create invoice
  const invRes = await fetch(
    `${ZOHO_BOOKS_BASE}/invoices?organization_id=${orgId}`,
    {
      method:  'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ invoice: invoicePayload }),
    },
  );
  const invData = await invRes.json();
  if (!invData.invoice) throw new Error(`Zoho Books invoice creation failed: ${JSON.stringify(invData)}`);

  const zohoInvoiceId = invData.invoice.invoice_id;
  const totalAmount   = invData.invoice.total;

  // Mark as paid – record a payment
  const paymentPayload = {
    invoice_id:      zohoInvoiceId,
    payment_mode:    'razorpay',
    amount:          totalAmount,
    date:            invoiceDate,
    reference_number: razorpayPaymentId,
    description:     `Razorpay payment ${razorpayPaymentId}`,
  };

  await fetch(
    `${ZOHO_BOOKS_BASE}/customerpayments?organization_id=${orgId}`,
    {
      method:  'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ payment: paymentPayload }),
    },
  );

  return invData.invoice;
}
