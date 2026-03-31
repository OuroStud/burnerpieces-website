/**
 * Shiprocket API – auto-create shipment after payment
 * Docs: https://apidocs.shiprocket.in/
 *
 * Required env secrets:
 *   SHIPROCKET_EMAIL
 *   SHIPROCKET_PASSWORD
 *   SHIPROCKET_PICKUP_LOCATION  (label from Shiprocket dashboard, e.g. "Primary")
 *
 * Shiprocket uses JWT that expires every 24 h.
 * We re-authenticate on every call (Worker is stateless).
 * For production, cache the token in a KV namespace.
 */

const SR_BASE = 'https://apiv2.shiprocket.in/v1/external';

async function getShiprocketToken(env) {
  const res = await fetch(`${SR_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      email:    env.SHIPROCKET_EMAIL,
      password: env.SHIPROCKET_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

/**
 * Create a forward order in Shiprocket.
 *
 * @param {object} env
 * @param {object} params
 *   orderId, orderDate (YYYY-MM-DD HH:mm),
 *   customer { name, email, phone, address, city, state, pincode, country },
 *   items [{ name, sku, qty, price, weight_kg }],
 *   paymentMethod ('prepaid' | 'COD')
 * @returns {object} shiprocketOrder
 */
export async function createShiprocketOrder(env, params) {
  const { orderId, orderDate, customer, items, paymentMethod = 'prepaid' } = params;
  const token = await getShiprocketToken(env);

  const orderTotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const totalWeight = items.reduce((sum, i) => sum + (i.weight_kg ?? 0.3) * i.qty, 0);

  const orderPayload = {
    order_id:           orderId,
    order_date:         orderDate,
    pickup_location:    env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    channel_id:         '',
    comment:            'Burner Pieces Order',
    billing_customer_name: customer.name,
    billing_last_name:  '',
    billing_address:    customer.address,
    billing_city:       customer.city,
    billing_pincode:    customer.pincode,
    billing_state:      customer.state,
    billing_country:    customer.country || 'India',
    billing_email:      customer.email,
    billing_phone:      customer.phone,
    shipping_is_billing: true,
    order_items:        items.map(i => ({
      name:         i.name,
      sku:          i.sku || `SKU-${i.name.replace(/\s+/g, '-').toUpperCase()}`,
      units:        i.qty,
      selling_price: i.price,
      discount:     0,
      tax:          0,
      hsn:          i.hsn || '',
    })),
    payment_method:     paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    shipping_charges:   0,
    giftwrap_charges:   0,
    transaction_charges: 0,
    total_discount:     0,
    sub_total:          orderTotal,
    length:             20,      // cm – update per actual packaging
    breadth:            15,
    height:             5,
    weight:             parseFloat(totalWeight.toFixed(2)) || 0.5,
  };

  const res = await fetch(`${SR_BASE}/orders/create/adhoc`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Shiprocket order failed: ${JSON.stringify(data)}`);
  return data;
}
