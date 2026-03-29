/* ============================
   CART SYSTEM
   Persistent cart using localStorage
   ============================ */

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('burnerCart')) || [];
    this.updateUI();
  }

  save() {
    localStorage.setItem('burnerCart', JSON.stringify(this.items));
    this.updateUI();
  }

  addItem(productId, size = null, qty = 1) {
    const product = getProductById(productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(
      item => item.id === productId && item.size === size
    );

    if (existingIndex > -1) {
      this.items[existingIndex].qty += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: size || product.sizes[0],
        qty: qty
      });
    }

    this.save();
    this.showSidebar();
    showToast(`${product.name} added to cart!`);
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
  }

  updateQty(index, delta) {
    this.items[index].qty += delta;
    if (this.items[index].qty <= 0) {
      this.removeItem(index);
    } else {
      this.save();
    }
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  clear() {
    this.items = [];
    this.save();
  }

  updateUI() {
    // Update cart count badges
    document.querySelectorAll('#cartCount, .cart-count-global').forEach(el => {
      el.textContent = this.getCount();
    });

    // Update cart sidebar items
    const cartItemsEl = document.getElementById('cartItems');
    const cartFooterEl = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');

    if (!cartItemsEl) return;

    if (this.items.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-bag"></i>
          <p>Your cart is empty</p>
        </div>`;
      if (cartFooterEl) cartFooterEl.style.display = 'none';
    } else {
      cartItemsEl.innerHTML = this.items.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-img"><img src="${item.image}" alt="${item.name}"></div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')} · Size: ${item.size}</p>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="cart.updateQty(${i}, -1)">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="cart.updateQty(${i}, 1)">+</button>
              <span class="cart-item-remove" onclick="cart.removeItem(${i})">Remove</span>
            </div>
          </div>
        </div>
      `).join('');
      if (cartFooterEl) cartFooterEl.style.display = 'block';
      if (cartTotalEl) cartTotalEl.textContent = `₹${this.getTotal().toLocaleString('en-IN')}`;
    }
  }

  showSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Global cart instance
const cart = new Cart();

// Global helper
function addToCart(productId, size, qty) {
  cart.addItem(productId, size, qty);
}

// Toast notification
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('active'));
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
