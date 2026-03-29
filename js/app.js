/* ============================
   APP.JS - Main Application Logic
   Navigation, search, forms, Razorpay, Shiprocket
   ============================ */

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

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open clicked if not already active
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* --- NEWSLETTER / CONTACT FORM HANDLING --- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(newsletterForm);
      const data = Object.fromEntries(formData.entries());

      // Store subscriber data locally (will be sent to backend in production)
      saveFormData('subscribers', data);

      showToast('Thank you for subscribing!');
      newsletterForm.reset();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      data.submittedAt = new Date().toISOString();

      saveFormData('contacts', data);
      showToast('Message sent successfully!');
      contactForm.reset();
    });
  }

  /* --- SHOP FILTERS --- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      filterProducts(filter);
    });
  });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortProducts(sortSelect.value);
    });
  }

  /* --- SIZE SELECTORS --- */
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-options').querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  /* --- COLOR SELECTORS --- */
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatch.closest('.color-options').querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
    });
  });
});


/* ============================
   DATA COLLECTION SYSTEM
   Stores form submissions in localStorage
   In production, replace with API calls
   ============================ */

function saveFormData(type, data) {
  const key = `burner_${type}`;
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  data.id = Date.now().toString(36);
  data.timestamp = new Date().toISOString();
  existing.push(data);
  localStorage.setItem(key, JSON.stringify(existing));
  console.log(`[Data Saved] ${type}:`, data);
}

function getFormData(type) {
  return JSON.parse(localStorage.getItem(`burner_${type}`)) || [];
}

function exportDataAsCSV(type) {
  const data = getFormData(type);
  if (data.length === 0) return alert('No data to export');

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


/* ============================
   RAZORPAY INTEGRATION
   Replace key with your live Razorpay key
   ============================ */

function initiateRazorpayPayment(orderDetails) {
  const options = {
    key: rzp_live_SX3Gw1GrP0jJIy, // ← Replace with your Razorpay Key ID
    amount: orderDetails.amount * 100, // Razorpay expects paise
    currency: 'INR',
    name: 'Burner Pieces',
    description: 'Order Payment',
    image: '', // Add your logo URL
    order_id: orderDetails.razorpayOrderId || '', // From your backend
    handler: function(response) {
      // Payment successful
      console.log('Payment Success:', response);
      const paymentData = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        order: orderDetails
      };

      // Save order locally
      saveFormData('orders', paymentData);

      // Create Shiprocket shipment
      createShiprocketOrder(orderDetails, response.razorpay_payment_id);

      // Clear cart and redirect
      cart.clear();
      window.location.href = 'order-confirmation.html';
    },
    prefill: {
      name: orderDetails.customerName,
      email: orderDetails.email,
      contact: orderDetails.phone
    },
    theme: {
      color: '#1a1a1a'
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled by user');
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function(response) {
    console.error('Payment Failed:', response.error);
    showToast('Payment failed. Please try again.');
  });
  rzp.open();
}


/* ============================
   SHIPROCKET INTEGRATION
   Auto-creates shipment after successful payment
   In production, call your backend API
   ============================ */

async function createShiprocketOrder(orderDetails, paymentId) {
  // NOTE: In production, this should call YOUR backend server
  // which then calls Shiprocket API with your credentials.
  // Never expose Shiprocket API tokens in frontend code.

  const shipmentData = {
    order_id: `BP-${Date.now()}`,
    order_date: new Date().toISOString(),
    pickup_location: "Primary",
    billing_customer_name: orderDetails.customerName,
    billing_last_name: orderDetails.lastName || "",
    billing_address: orderDetails.address,
    billing_city: orderDetails.city,
    billing_pincode: orderDetails.pincode,
    billing_state: orderDetails.state,
    billing_country: "India",
    billing_email: orderDetails.email,
    billing_phone: orderDetails.phone,
    shipping_is_billing: true,
    order_items: orderDetails.items.map(item => ({
      name: item.name,
      sku: item.id,
      units: item.qty,
      selling_price: item.price,
      discount: 0,
      tax: 0
    })),
    payment_method: "Prepaid",
    sub_total: orderDetails.amount,
    length: 20,
    breadth: 15,
    height: 10,
    weight: 0.5
  };

  console.log('[Shiprocket] Order data prepared:', shipmentData);

  // In production, POST to your backend:
  // const response = await fetch('/api/shiprocket/create-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(shipmentData)
  // });
  // const result = await response.json();
  // console.log('Shiprocket order created:', result);

  saveFormData('shipments', shipmentData);
  return shipmentData;
}


/* ============================
   CHECKOUT HANDLER
   ============================ */

function processCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate required fields
  const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
  const missing = required.filter(f => !data[f]?.trim());
  if (missing.length > 0) {
    showToast('Please fill in all required fields');
    return;
  }

  // Build order details
  const orderDetails = {
    customerName: `${data.firstName} ${data.lastName}`,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    items: cart.items,
    amount: cart.getTotal(),
    shippingCost: cart.getTotal() >= 999 ? 0 : 99,
    totalAmount: cart.getTotal() + (cart.getTotal() >= 999 ? 0 : 99)
  };

  // Initiate payment
  initiateRazorpayPayment(orderDetails);
}


/* ============================
   PRODUCT FILTERING & SORTING
   ============================ */

function filterProducts(filter) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.category === filter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function sortProducts(sortBy) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  cards.sort((a, b) => {
    const priceA = parseInt(a.querySelector('.current').textContent.replace(/[₹,]/g, ''));
    const priceB = parseInt(b.querySelector('.current').textContent.replace(/[₹,]/g, ''));

    switch (sortBy) {
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'name': return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
      default: return 0;
    }
  });

  cards.forEach(card => grid.appendChild(card));
}


/* ============================
   SEARCH FUNCTIONALITY
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
      // You can render search results in a dropdown here
    });
  }
});
