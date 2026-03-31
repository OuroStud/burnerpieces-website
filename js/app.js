/* ============================
   APP.JS - Main Application Logic
   Navigation, search, forms, Razorpay, backend API
   ============================ */

/* ── Backend URL ─────────────────────────────────────────────────────────────
   All /api/* calls go to the same domain (Cloudflare routes them to the Worker)
   No change needed here — this works automatically once the Worker is deployed.
   ─────────────────────────────────────────────────────────────────────────── */
const API_BASE = '';  // same origin — Worker handles /api/* on burnerpieces.com

document.addEventListener('DOMContentLoaded', () => {

  /* --- NAVBAR SCROLL --- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* --- HAMBURGER MENU --- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  /* --- SEARCH TOGGLE --- */
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', () => {
      searchOverlay.classList.toggle('active');
      if (searchOverlay.classList.contains('active')) {
        document.getElementById('searchInput')?.focus();
      }
    });
    searchClose?.addEventListener('click', () => searchOverlay.classList.remove('active'));
  }

  /* --- CART SIDEBAR TOGGLE --- */
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartToggle) cartToggle.addEventListener('click', () => cart.showSidebar());
  if (cartClose) cartClose.addEventListener('click', () => cart.hideSidebar());
  if (cartOverlay) cartOverlay.addEventListener('click', () => cart.hideSidebar());

  /* --- FAQ ACCORDION --- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* --- NEWSLETTER FORM --- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = 'Subscribing… <i class="fas fa-spinner fa-spin"></i>';

      const formData = new FormData(newsletterForm);
      const data = Object.fromEntries(formData.entries());
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');

      try {
        const res = await fetch(`${API_BASE}/api/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, name: fullName }),
        });
        const json = await res.json();
        if (json.success) {
          showToast('Thank you for subscribing! Check your inbox.');
          newsletterForm.reset();
        } else {
          showToast(json.error || 'Something went wrong. Please try again.');
        }
      } catch {
        showToast('Could not subscribe right now. Please try again.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Subscribe <i class="fas fa-arrow-right"></i>';
      }
    });
  }

  /* --- CONTACT FORM (handled separately in contact.html inline script,
         but this covers any page that has a simple #contactForm) --- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm && !contactForm.dataset.managed) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm).entries());
      await submitContactForm(data);
    });
  }

  /* --- SHOP FILTERS --- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProducts(btn.dataset.filter);
    });
  });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => sortProducts(sortSelect.value));
  }

  /* --- SIZE / COLOR SELECTORS --- */
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-options').querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatch.closest('.color-options').querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
    });
  });
});


/* ============================
   CONTACT FORM API CALL
   Called from contact.html inline script
   ============================ */
async function submitContactForm(data) {
  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    data.name    || '',
        email:   data.email   || '',
        phone:   data.phone   || '',
        subject: data.reasonLabel || data.reason || 'Website Enquiry',
        message: data.message || '',
      }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}


/* ============================
   RAZORPAY KEY
   Replace rzp_live_YOUR_KEY_HERE with your actual live Key ID.
   The Key Secret is stored securely in Cloudflare — never put it here.
   ============================ */
const RAZORPAY_KEY_ID = 'rzp_live_YOUR_KEY_HERE'; // ← replace this


/* ============================
   CHECKOUT HANDLER
   Called by the "Pay with Razorpay" button in checkout.html
   ============================ */
function processCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const data = Object.fromEntries(new FormData(form).entries());

  // Validate required fields
  const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
  const missing = required.filter(f => !data[f]?.trim());
  if (missing.length > 0) {
    showToast('Please fill in all required fields');
    return;
  }

  if (cart.items.length === 0) {
    showToast('Your cart is empty');
    return;
  }

  // Use final amounts calculated by checkout.html (after discount)
  const co = window._checkoutFinal || window._checkout;
  if (!co) return;

  const totalAmount = co.total;   // in rupees, already includes GST + shipping − discount
  const amountPaise = Math.round(totalAmount * 100);

  // Build items array for backend
  const items = cart.items.map(item => ({
    name:       item.name,
    qty:        item.qty,
    unitPrice:  item.price,
    sku:        item.id,
    hsn:        '6109',       // standard HSN for apparel — update per product if needed
    weight_kg:  0.3,
  }));

  const customer = {
    name:    `${data.firstName} ${data.lastName}`.trim(),
    email:   data.email,
    phone:   data.phone,
    address: [data.address, data.address2].filter(Boolean).join(', '),
    city:    data.city,
    state:   data.state,
    pincode: data.pincode,
    country: 'India',
    gstin:   data.gstin || '',
  };

  // Open Razorpay checkout
  const options = {
    key:         RAZORPAY_KEY_ID,
    amount:      amountPaise,
    currency:    'INR',
    name:        'Burner Pieces',
    description: `${cart.getCount()} item${cart.getCount() > 1 ? 's' : ''}`,
    image:       '/favicon-32x32.png',

    prefill: {
      name:    customer.name,
      email:   customer.email,
      contact: customer.phone,
    },

    theme: { color: '#1a1a1a' },

    /* ── Called by Razorpay after successful payment ── */
    handler: async function (response) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

      showToast('Verifying payment…');

      try {
        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            customer,
            items,
            amount: amountPaise,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          // Store invoice number for order-confirmation page
          sessionStorage.setItem('bp_last_invoice', verifyData.invoiceNumber || '');
          sessionStorage.setItem('bp_last_order',   razorpay_order_id || '');
          cart.clear();
          // Redirect to confirmation page
          const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
          window.location.href = `${base}order-confirmation.html`;
        } else {
          showToast('Payment verification failed. Please contact support@burnerpieces.com');
        }
      } catch {
        showToast('Network error. Please contact support@burnerpieces.com with your payment ID: ' + razorpay_payment_id);
      }
    },

    modal: {
      ondismiss: () => showToast('Payment cancelled. Your cart is saved.'),
    },
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', (response) => {
    showToast('Payment failed: ' + (response.error?.description || 'Please try again.'));
  });
  rzp.open();
}


/* ============================
   PRODUCT FILTERING & SORTING
   ============================ */
function filterProducts(filter) {
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
  });
}

function sortProducts(sortBy) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  cards.sort((a, b) => {
    const priceA = parseInt(a.querySelector('.current')?.textContent.replace(/[₹,]/g, '') || '0');
    const priceB = parseInt(b.querySelector('.current')?.textContent.replace(/[₹,]/g, '') || '0');
    switch (sortBy) {
      case 'price-low':  return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'name':       return a.querySelector('h3')?.textContent.localeCompare(b.querySelector('h3')?.textContent);
      default:           return 0;
    }
  });
  cards.forEach(card => grid.appendChild(card));
}


/* ============================
   SEARCH
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) return;
      const results = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      console.log('Search results:', results);
    });
  }
});


/* ============================
   LEGACY HELPER — kept so nothing breaks
   Old localStorage calls from inline scripts will call this,
   but now it's a no-op (real data goes to backend).
   ============================ */
function saveFormData(type, data) {
  console.log(`[Legacy saveFormData] type=${type}`, data);
  // Data is now persisted server-side. No localStorage needed.
}
function getFormData(type) { return []; }
