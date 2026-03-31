/**
 * frontend-checkout.js
 * Drop this into your existing static site JS.
 * Replace RAZORPAY_KEY_ID with your actual Key ID (safe to expose in frontend).
 */

const RAZORPAY_KEY_ID = 'rzp_live_YOUR_KEY_ID'; // ← your public key
const API_BASE        = 'https://burnerpieces.com/api';

/**
 * Call this function when the customer clicks "Pay Now".
 *
 * @param {object} cartItems  - [{ name, qty, unitPrice, sku, hsn, weight_kg }]
 * @param {object} customer   - { name, email, phone, address, city, state, pincode }
 * @param {number} amountINR  - total in Rupees (not paise)
 */
async function initiateCheckout(cartItems, customer, amountINR) {
  // 1. Create Razorpay order via your backend (or via Razorpay directly from frontend
  //    using Orders API — but prefer server-side to avoid order tampering).
  //    Below assumes you expose POST /api/payment/create-order (optional helper endpoint).
  //    For simplicity, you can create the order client-side using the Razorpay JS SDK:

  const amountPaise = Math.round(amountINR * 100);

  const options = {
    key:         RAZORPAY_KEY_ID,
    amount:      amountPaise,
    currency:    'INR',
    name:        'Burner Pieces',
    description: 'Fashion Order',
    image:       'https://burnerpieces.com/assets/logo.png',

    // Prefill customer details
    prefill: {
      name:    customer.name,
      email:   customer.email,
      contact: customer.phone,
    },

    theme: { color: '#111111' },

    // ── Called after payment succeeds on Razorpay's side ──────────────
    handler: async function (response) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

      try {
        showLoader('Verifying payment…');

        const res = await fetch(`${API_BASE}/payment/verify`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            customer,
            items:  cartItems,
            amount: amountPaise,
          }),
        });

        const data = await res.json();

        if (data.success) {
          showSuccess(`Order confirmed! Invoice #${data.invoiceNumber} will be emailed to you.`);
          clearCart();
        } else {
          showError('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error(err);
        showError('Something went wrong. Please contact hello@burnerpieces.com');
      } finally {
        hideLoader();
      }
    },

    modal: {
      ondismiss: () => console.log('Razorpay modal closed'),
    },
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function (response) {
    console.error('Payment failed:', response.error);
    showError(`Payment failed: ${response.error.description}`);
  });
  rzp.open();
}

// ── Stub helpers – replace with your actual UI functions ──────────────────────
function showLoader(msg)  { console.log('[loader]', msg); }
function hideLoader()     { }
function showSuccess(msg) { alert(msg); }
function showError(msg)   { alert(msg); }
function clearCart()      { /* clear localStorage cart */ }
