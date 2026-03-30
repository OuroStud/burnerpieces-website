/* ============================
   PRODUCTS DATA & ENGINE
   
   IMAGE STRUCTURE:
   Each product has TWO image fields:
   - images: ["url1", "url2", "url3"] — default/main images (front, back, side)
   - colorImages: { "#hex": ["url1", "url2", "url3"], ... } — images per color (OPTIONAL)
   
   If colorImages exists for a color, clicking that color swaps to its image set.
   If colorImages is missing or a color isn't in it, the default images[] are shown.
   
   TO ADD A PRODUCT: Copy any product block below, change the values, and add it to the array.
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
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80"
    ],
    colorImages: {
      "#1a1a1a": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80"
      ],
      "#ffffff": [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&q=80"
      ]
    },
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
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80"
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
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&q=80"
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
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80"
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
      "https://images.unsplash.com/photo-1519235106423-2a22ae081895?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
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
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80"
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
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80"
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
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80"
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
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"
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
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=600&q=80",
      "https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=600&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#f5f5dc", "#c88ea7", "#5c5c3d"],
    badge: null,
    description: "Chunky cable-knit sweater in a relaxed oversized silhouette. Soft acrylic-wool blend, ribbed cuffs, and drop shoulders.",
    inStock: true
  }
];

/* ============================
   COLOR NAME MAP
   ============================ */
const colorNames = {
  '#1a1a1a': 'Black', '#000000': 'Black', '#ffffff': 'White', '#f5f5dc': 'Beige',
  '#4a6741': 'Olive', '#5c5c3d': 'Army Green', '#8b7355': 'Tan', '#87ceeb': 'Sky Blue',
  '#c88ea7': 'Rose', '#2f4f4f': 'Dark Teal', '#4169e1': 'Royal Blue', '#c3b091': 'Khaki',
  '#1a3a5c': 'Indigo', '#f5f5f5': 'Off White', '#ff7f50': 'Coral', '#008080': 'Teal',
  '#800020': 'Burgundy', '#228b22': 'Forest Green', '#ffd700': 'Yellow', '#800080': 'Purple'
};

/* ============================
   RENDER PRODUCT CARD
   ============================ */
function renderProductCard(product, basePath) {
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.badge}">${
        product.badge === 'bestseller' ? 'Best Seller' :
        product.badge === 'new' ? 'New' : 'Sale'
      }</span>` : '';

  const priceHTML = product.originalPrice
    ? `<span class="current">₹${product.price.toLocaleString('en-IN')}</span>
       <span class="original">₹${product.originalPrice.toLocaleString('en-IN')}</span>`
    : `<span class="current">₹${product.price.toLocaleString('en-IN')}</span>`;

  const sizesHTML = product.sizes.map(s =>
    `<span class="size-dot size-selectable" onclick="selectSize(this, '${product.id}')" data-size="${s}">${s}</span>`
  ).join('');

  const colorsHTML = product.colors && product.colors.length > 0
    ? `<div class="product-colors">${product.colors.map((c, i) =>
        `<span class="color-dot color-selectable${i === 0 ? ' selected' : ''}" 
          style="background:${c};${c === '#ffffff' || c === '#f5f5dc' || c === '#f5f5f5' ? 'border:1.5px solid #ccc;' : ''}" 
          title="${colorNames[c.toLowerCase()] || c}" 
          data-color="${c}"
          onclick="selectCardColor(this, '${product.id}', '${c}')"></span>`
      ).join('')}</div>` : '';

  const imgCount = product.images.length;

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}" data-img-index="0">
      ${badgeHTML}
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" id="card-img-${product.id}">
        ${imgCount > 1 ? `
          <button class="card-arrow card-arrow-left" onclick="event.stopPropagation();cardArrow('${product.id}', -1)"><i class="fas fa-chevron-left"></i></button>
          <button class="card-arrow card-arrow-right" onclick="event.stopPropagation();cardArrow('${product.id}', 1)"><i class="fas fa-chevron-right"></i></button>
          <div class="card-dots" id="card-dots-${product.id}">${product.images.map((_, i) => `<span class="card-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
        ` : ''}
        <div class="product-actions">
          <button class="btn-add-cart" onclick="event.stopPropagation();addToCartWithSize('${product.id}')">Add to Cart</button>
          <button class="btn-quick-view" onclick="event.stopPropagation();quickView('${product.id}')">Quick View</button>
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

/* ============================
   CARD IMAGE ARROW NAVIGATION
   ============================ */
function cardArrow(productId, direction) {
  const product = getProductById(productId);
  if (!product) return;
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (!card) return;

  // Get current image set (may be color-specific)
  const currentImages = getActiveImages(product, card);
  let idx = parseInt(card.dataset.imgIndex || 0) + direction;
  if (idx < 0) idx = currentImages.length - 1;
  if (idx >= currentImages.length) idx = 0;

  card.dataset.imgIndex = idx;
  const img = document.getElementById('card-img-' + productId);
  if (img) img.src = currentImages[idx];

  // Update dots
  const dots = document.getElementById('card-dots-' + productId);
  if (dots) {
    dots.innerHTML = currentImages.map((_, i) => `<span class="card-dot${i === idx ? ' active' : ''}"></span>`).join('');
  }
}

/* Get active image set based on selected color */
function getActiveImages(product, cardOrModal) {
  const selectedColor = cardOrModal?.querySelector('.color-selectable.selected');
  if (selectedColor && product.colorImages) {
    const colorHex = selectedColor.dataset.color;
    if (product.colorImages[colorHex]) return product.colorImages[colorHex];
  }
  return product.images;
}

/* Select color on card and swap images */
function selectCardColor(el, productId, colorHex) {
  const card = el.closest('.product-card');
  if (!card) return;
  card.querySelectorAll('.color-selectable').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  const product = getProductById(productId);
  if (!product) return;

  // Swap to color-specific images or default
  const newImages = (product.colorImages && product.colorImages[colorHex]) || product.images;
  card.dataset.imgIndex = 0;
  const img = document.getElementById('card-img-' + productId);
  if (img) img.src = newImages[0];

  // Update dots
  const dots = document.getElementById('card-dots-' + productId);
  if (dots) {
    dots.innerHTML = newImages.map((_, i) => `<span class="card-dot${i === 0 ? ' active' : ''}"></span>`).join('');
  }
}

/* ============================
   RENDER PRODUCTS
   ============================ */
function renderProducts(containerId, filter, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let filtered = (!filter || filter === 'all') ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  if (limit) filtered = filtered.slice(0, limit);
  container.innerHTML = filtered.map(p => renderProductCard(p)).join('');
}

function getProductById(id) { return PRODUCTS.find(p => p.id === id); }

/* ============================
   QUICK VIEW MODAL
   ============================ */
function quickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

  const priceHTML = product.originalPrice
    ? `₹${product.price.toLocaleString('en-IN')} <span style="text-decoration:line-through;color:#999;font-size:0.9rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>`
    : `₹${product.price.toLocaleString('en-IN')}`;

  const imgs = product.images;
  const thumbsHTML = imgs.map((img, i) =>
    `<img src="${img}" alt="View ${i+1}" class="modal-thumb${i === 0 ? ' active' : ''}" onclick="modalThumbClick(this, '${img}')" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:2px solid ${i === 0 ? 'var(--color-accent)' : 'transparent'};cursor:pointer;">`
  ).join('');

  const colorsModalHTML = product.colors && product.colors.length > 0
    ? `<div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Color</label>
        <div style="display:flex;gap:8px;">
          ${product.colors.map((c, i) => `<span class="color-dot color-selectable${i === 0 ? ' selected' : ''}" style="background:${c};width:28px;height:28px;${c === '#ffffff' || c === '#f5f5dc' || c === '#f5f5f5' ? 'border:1.5px solid #ccc;' : ''}" title="${colorNames[c.toLowerCase()] || c}" data-color="${c}" onclick="modalColorSelect(this, '${productId}', '${c}')"></span>`).join('')}
        </div>
      </div>` : '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('data-product-id', productId);
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal(this)"><i class="fas fa-times"></i></button>
      <div class="product-layout" style="gap:32px;">
        <div class="product-gallery" style="position:relative;">
          <div class="product-main-image" style="position:relative;">
            <img src="${imgs[0]}" alt="${product.name}" id="modal-main-img">
            ${imgs.length > 1 ? `
              <button class="modal-arrow modal-arrow-left" onclick="modalArrow('${productId}', -1)"><i class="fas fa-chevron-left"></i></button>
              <button class="modal-arrow modal-arrow-right" onclick="modalArrow('${productId}', 1)"><i class="fas fa-chevron-right"></i></button>
            ` : ''}
          </div>
          <div class="product-thumbnails" id="modal-thumbs" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">${thumbsHTML}</div>
        </div>
        <div class="product-info">
          <h1 style="font-size:1.5rem;font-family:var(--font-display);margin-bottom:12px;">${product.name}</h1>
          <div class="price-display" style="font-size:1.4rem;font-weight:600;color:var(--color-accent-dark);margin-bottom:16px;">${priceHTML}</div>
          <p style="color:var(--color-text-muted);line-height:1.7;margin-bottom:20px;">${product.description}</p>
          ${colorsModalHTML}
          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Size</label>
            <div style="display:flex;gap:8px;">
              ${product.sizes.map(s => `<button class="size-option" onclick="this.parentElement.querySelectorAll('.size-option').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')">${s}</button>`).join('')}
            </div>
          </div>
          <div class="add-to-cart-section">
            <button class="btn-primary" onclick="addToCart('${product.id}');closeModal(this)">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal._imgIndex = 0;
  requestAnimationFrame(() => modal.classList.add('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
}

function closeModal(el) {
  const modal = el.closest ? el.closest('.modal-overlay') : el;
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => modal.remove(), 300);
}

/* Modal arrow navigation */
function modalArrow(productId, direction) {
  const modal = document.querySelector('.modal-overlay[data-product-id="' + productId + '"]');
  if (!modal) return;
  const product = getProductById(productId);
  if (!product) return;

  const activeImages = getActiveImages(product, modal);
  let idx = (modal._imgIndex || 0) + direction;
  if (idx < 0) idx = activeImages.length - 1;
  if (idx >= activeImages.length) idx = 0;
  modal._imgIndex = idx;

  document.getElementById('modal-main-img').src = activeImages[idx];
  updateModalThumbs(activeImages, idx);
}

/* Modal thumbnail click */
function modalThumbClick(el, imgUrl) {
  document.getElementById('modal-main-img').src = imgUrl;
  const thumbs = el.closest('.product-thumbnails');
  if (thumbs) {
    thumbs.querySelectorAll('img').forEach((t, i) => {
      const isActive = t === el;
      t.style.borderColor = isActive ? 'var(--color-accent)' : 'transparent';
      t.classList.toggle('active', isActive);
    });
  }
  // Update index
  const modal = el.closest('.modal-overlay');
  if (modal) {
    const allThumbs = Array.from(thumbs.querySelectorAll('img'));
    modal._imgIndex = allThumbs.indexOf(el);
  }
}

/* Modal color select — swaps image set */
function modalColorSelect(el, productId, colorHex) {
  const modal = el.closest('.modal-overlay');
  if (!modal) return;
  modal.querySelectorAll('.color-selectable').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  const product = getProductById(productId);
  if (!product) return;

  const newImages = (product.colorImages && product.colorImages[colorHex]) || product.images;
  modal._imgIndex = 0;
  document.getElementById('modal-main-img').src = newImages[0];
  updateModalThumbs(newImages, 0);
}

/* Rebuild modal thumbnails for new image set */
function updateModalThumbs(images, activeIdx) {
  const container = document.getElementById('modal-thumbs');
  if (!container) return;
  container.innerHTML = images.map((img, i) =>
    `<img src="${img}" alt="View ${i+1}" class="modal-thumb${i === activeIdx ? ' active' : ''}" onclick="modalThumbClick(this, '${img}')" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:2px solid ${i === activeIdx ? 'var(--color-accent)' : 'transparent'};cursor:pointer;">`
  ).join('');
}

/* ============================
   UTILITY FUNCTIONS
   ============================ */
function selectSize(el, productId) {
  const card = el.closest('.product-card') || el.closest('.product-info');
  if (card) card.querySelectorAll('.size-selectable').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function selectColor(el, productId) {
  const card = el.closest('.product-card') || el.closest('.product-info');
  if (card) card.querySelectorAll('.color-selectable').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function addToCartWithSize(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  let size = null, color = null;
  if (card) {
    const selSize = card.querySelector('.size-selectable.selected');
    size = selSize ? selSize.dataset.size : null;
    const selColor = card.querySelector('.color-selectable.selected');
    color = selColor ? selColor.dataset.color : null;
  }
  addToCart(productId, size);
}

/* Initialize */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featuredProducts')) renderProducts('featuredProducts', 'all', 4);
  if (document.getElementById('accessoriesProducts')) renderProducts('accessoriesProducts', 'accessories');
});
