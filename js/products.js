/* ============================
   PRODUCTS DATA & ENGINE
   Products stored in JSON format for easy management.
   To add/edit products, modify the PRODUCTS array below.
   ============================ */

const PRODUCTS = [
  {
    id: "bp-m-001",
    name: "Classic Cotton Tee",
    category: "men",
    price: 1299,
    originalPrice: 1599,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#1a1a1a", "#ffffff", "#4a6741"],
    badge: "bestseller",
    description: "Premium 100% organic cotton tee with a relaxed fit. Designed for all-day comfort with reinforced stitching and pre-shrunk fabric.",
    inStock: true
  },
  {
    id: "bp-m-002",
    name: "Urban Cargo Pants",
    category: "men",
    price: 2499,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["#5c5c3d", "#1a1a1a", "#8b7355"],
    badge: "new",
    description: "Tactical-inspired cargo pants with modern slim profile. Multiple utility pockets, adjustable waist, and stretch cotton blend.",
    inStock: true
  },
  {
    id: "bp-m-003",
    name: "Linen Summer Shirt",
    category: "men",
    price: 1899,
    originalPrice: 2299,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#f5f5dc", "#87ceeb", "#1a1a1a"],
    badge: null,
    description: "Breathable pure linen shirt perfect for warm weather. Features a relaxed collar, chest pocket, and curved hem.",
    inStock: true
  },
  {
    id: "bp-m-004",
    name: "Denim Jacket - Indigo",
    category: "men",
    price: 3499,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["#1a3a5c", "#1a1a1a"],
    badge: null,
    description: "Heritage-wash indigo denim jacket with copper-tone buttons. Structured shoulders with a tailored fit that layers effortlessly.",
    inStock: true
  },
  {
    id: "bp-m-005",
    name: "Slim Chinos - Khaki",
    category: "men",
    price: 1999,
    originalPrice: 2499,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
      "https://images.unsplash.com/photo-1519235106423-2a22ae081895?w=600&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#c3b091", "#1a1a1a", "#2f4f4f"],
    badge: "sale",
    description: "Modern slim-fit chinos in stretch cotton twill. Flat front, zip fly, and tapered leg for a clean silhouette.",
    inStock: true
  },
  {
    id: "bp-w-001",
    name: "Floral Wrap Dress",
    category: "women",
    price: 2799,
    originalPrice: 3299,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["#c88ea7", "#2f4f4f", "#f5f5dc"],
    badge: "bestseller",
    description: "Elegant wrap dress in flowing viscose with a botanical print. Adjustable waist tie, flutter sleeves, and midi length.",
    inStock: true
  },
  {
    id: "bp-w-002",
    name: "Cropped Blazer",
    category: "women",
    price: 3999,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#1a1a1a", "#f5f5dc", "#c88ea7"],
    badge: "new",
    description: "Sharp cropped blazer in structured twill. Single-button closure, notched lapel, and functional pockets. Dress up or down.",
    inStock: true
  },
  {
    id: "bp-w-003",
    name: "High-Rise Wide Leg Jeans",
    category: "women",
    price: 2299,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#4169e1", "#1a1a1a"],
    badge: null,
    description: "Vintage-inspired wide leg jeans with a high-rise waist. Non-stretch denim for an authentic feel with a flattering fit.",
    inStock: true
  },
  {
    id: "bp-w-004",
    name: "Silk Camisole Top",
    category: "women",
    price: 1599,
    originalPrice: 1999,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["#f5f5dc", "#1a1a1a", "#c88ea7", "#87ceeb"],
    badge: "sale",
    description: "Luxurious silk-blend camisole with adjustable spaghetti straps. Lace-trimmed neckline, bias cut for a flattering drape.",
    inStock: true
  },
  {
    id: "bp-w-005",
    name: "Oversized Knit Sweater",
    category: "women",
    price: 2199,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=600&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#f5f5dc", "#c88ea7", "#5c5c3d"],
    badge: null,
    description: "Chunky cable-knit sweater in a relaxed oversized silhouette. Soft acrylic-wool blend, ribbed cuffs, and drop shoulders.",
    inStock: true
  }
];

/* Render a product card HTML */
function renderProductCard(product, basePath = '') {
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.badge}">${
        product.badge === 'bestseller' ? 'Best Seller' :
        product.badge === 'new' ? 'New' : 'Sale'
      }</span>`
    : '';

  const priceHTML = product.originalPrice
    ? `<span class="current">₹${product.price.toLocaleString('en-IN')}</span>
       <span class="original">₹${product.originalPrice.toLocaleString('en-IN')}</span>`
    : `<span class="current">₹${product.price.toLocaleString('en-IN')}</span>`;

  const sizesHTML = product.sizes.map(s =>
    `<span class="size-dot size-selectable" onclick="selectSize(this, '${product.id}')" data-size="${s}">${s}</span>`
  ).join('');

  const colorNames = {
    '#1a1a1a': 'Black', '#000000': 'Black', '#ffffff': 'White', '#f5f5dc': 'Beige',
    '#4a6741': 'Olive', '#5c5c3d': 'Army Green', '#8b7355': 'Tan', '#87ceeb': 'Sky Blue',
    '#c88ea7': 'Rose', '#2f4f4f': 'Dark Teal', '#4169e1': 'Royal Blue', '#c3b091': 'Khaki',
    '#1a3a5c': 'Indigo', '#f5f5f5': 'Off White'
  };

  const colorsHTML = product.colors && product.colors.length > 0
    ? `<div class="product-colors">${product.colors.map((c, i) =>
        `<span class="color-dot color-selectable${i === 0 ? ' selected' : ''}" 
          style="background:${c};${c === '#ffffff' || c === '#f5f5dc' || c === '#f5f5f5' ? 'border:1.5px solid #ccc;' : ''}" 
          title="${colorNames[c.toLowerCase()] || c}" 
          data-color="${c}"
          onclick="selectColor(this, '${product.id}')"></span>`
      ).join('')}</div>`
    : '';

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      ${badgeHTML}
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        <div class="product-actions">
          <button class="btn-add-cart" onclick="addToCartWithSize('${product.id}')">Add to Cart</button>
          <button class="btn-quick-view" onclick="quickView('${product.id}')">Quick View</button>
        </div>
      </div>
      <div class="product-details">
        <h3>${product.name}</h3>
        <div class="product-price">${priceHTML}</div>
        ${colorsHTML}
        <div class="product-sizes">${sizesHTML}</div>
      </div>
    </div>
  `;
}

/* Render products to a container */
function renderProducts(containerId, filter = 'all', limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  if (limit) filtered = filtered.slice(0, limit);

  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
  container.innerHTML = filtered.map(p => renderProductCard(p, basePath)).join('');
}

/* Get product by ID */
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

/* Quick View Modal */
function quickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const priceHTML = product.originalPrice
    ? `₹${product.price.toLocaleString('en-IN')} <span style="text-decoration:line-through;color:#999;font-size:0.9rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>`
    : `₹${product.price.toLocaleString('en-IN')}`;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active');setTimeout(()=>this.closest('.modal-overlay').remove(),300)"><i class="fas fa-times"></i></button>
      <div class="product-layout" style="gap:32px;">
        <div class="product-gallery">
          <div class="product-main-image"><img src="${product.images[0]}" alt="${product.name}"></div>
        </div>
        <div class="product-info">
          <h1 style="font-size:1.5rem;">${product.name}</h1>
          <div class="price-display">${priceHTML}</div>
          <p class="description">${product.description}</p>
          <div class="size-selector">
            <label>Size</label>
            <div class="size-options">
              ${product.sizes.map(s => `<button class="size-option" onclick="this.parentElement.querySelectorAll('.size-option').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')">${s}</button>`).join('')}
            </div>
          </div>
          <div class="add-to-cart-section">
            <button class="btn-primary" onclick="addToCart('${product.id}');this.closest('.modal-overlay').classList.remove('active');setTimeout(()=>this.closest('.modal-overlay').remove(),300)">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

/* Initialize featured products on homepage */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featuredProducts')) {
    renderProducts('featuredProducts', 'all', 4);
  }
  if (document.getElementById('accessoriesProducts')) {
    renderProducts('accessoriesProducts', 'accessories');
  }
});

/* Select size on product card */
function selectSize(el, productId) {
  const card = el.closest('.product-card') || el.closest('.product-info');
  if (card) {
    card.querySelectorAll('.size-selectable').forEach(s => s.classList.remove('selected'));
  }
  el.classList.add('selected');
}

/* Select color on product card */
function selectColor(el, productId) {
  const card = el.closest('.product-card') || el.closest('.product-info');
  if (card) {
    card.querySelectorAll('.color-selectable').forEach(c => c.classList.remove('selected'));
  }
  el.classList.add('selected');
}

/* Add to cart with selected size and color */
function addToCartWithSize(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  let size = null;
  let color = null;
  if (card) {
    const selectedSize = card.querySelector('.size-selectable.selected');
    size = selectedSize ? selectedSize.dataset.size : null;
    const selectedColor = card.querySelector('.color-selectable.selected');
    color = selectedColor ? selectedColor.dataset.color : null;
  }
  addToCart(productId, size, 1, color);
}
