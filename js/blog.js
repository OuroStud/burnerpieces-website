/* ============================
   BLOG.JS — Blog Post Data & Engine
   
   HOW TO ADD A BLOG POST:
   1. Copy any post block below
   2. Change ALL the values (id, title, date, content, etc.)
   3. Save the file and push to GitHub — post appears automatically
   
   HOW TO EDIT A POST:
   Find it by its id below, change the text, save, push.
   
   HOW TO REMOVE A POST:
   Delete the entire { id: "...", ... } block for that post.
   ============================ */

const BLOG_POSTS = [
  {
    id: "bp-blog-001",
    title: "The Story Behind Burner Pieces",
    slug: "story-behind-burner-pieces",
    date: "2025-06-01",
    author: "The Burner Team",
    category: "brand",
    tags: ["brand story", "about us", "ouro studio"],
    coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
    excerpt: "How a small idea in Mumbai turned into a fashion brand built for the new age.",
    // Full HTML content for the blog post. Keep it clean — just paragraphs, h2, h3, and lists.
    content: `
      <p>Burner Pieces started with a simple question: why does fashion have to choose between looking good and feeling good?</p>
      
      <h2>Where It All Began</h2>
      <p>Born in Mumbai in 2024, Burner Pieces is the fashion label of Ouro Studio Private Limited. 
      We were tired of clothing that looked great on a rack but fell apart after five washes, or pieces 
      that were built to last but looked like they belonged in a 2005 catalogue.</p>
      
      <p>So we built something different. Every piece in our collection starts with the fabric — 
      premium materials sourced ethically, cut by people who care, and designed to look better with every wash.</p>
      
      <h2>What Burner Means</h2>
      <p>A burner is something that stays hot. That's what we want our pieces to be — consistently relevant, 
      consistently quality, never chasing trends but always ahead of them.</p>
      
      <h2>What's Next</h2>
      <p>We're just getting started. New drops every season, more collections for more people, 
      and a community of customers who care about what they wear as much as we do.</p>
      
      <p>Welcome to Burner Pieces. Stay hot.</p>
    `,
    featured: true,
  },
  {
    id: "bp-blog-002",
    title: "How to Style the Oversized Tee: 5 Looks for Every Occasion",
    slug: "how-to-style-oversized-tee",
    date: "2025-06-10",
    author: "The Burner Team",
    category: "style",
    tags: ["styling", "tee", "mens fashion", "tips"],
    coverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
    excerpt: "The oversized tee is the Swiss Army knife of your wardrobe. Here's how to wear it five different ways.",
    content: `
      <p>The oversized tee has earned its place as the cornerstone of modern casual dressing. 
      But wearing it well is an art. Here are five ways to style it for different occasions.</p>
      
      <h2>1. The Clean Casual</h2>
      <p>Tuck the front of your oversized tee loosely into slim-fit chinos. Add white sneakers. 
      This is the classic "effortless but put-together" look that works everywhere from brunch to a casual office.</p>
      
      <h2>2. The Street Layer</h2>
      <p>Wear it under an open overshirt or a light jacket. Let the tee hang below the jacket hem. 
      Works best with cargo pants and chunky sneakers or boots.</p>
      
      <h2>3. The Minimal Evening</h2>
      <p>A plain black oversized tee, well-fitted dark jeans, and clean leather shoes. Simple, 
      sharp, and surprisingly effective for a dinner or evening outing.</p>
      
      <h2>4. The Weekend Lounge</h2>
      <p>Full oversized everything — tee, joggers or wide-leg trousers, slides. Comfort is the 
      point and the aesthetic. Add sunglasses and you're done.</p>
      
      <h2>5. The Knot Edit</h2>
      <p>Tie a knot at the front hem to create a cropped effect. Pairs well with high-waisted 
      jeans or shorts. Works for both men and women.</p>
      
      <p>The oversized tee is versatile because it's a blank canvas. Start with great fabric 
      and you can dress it in any direction.</p>
    `,
    featured: false,
  },
  {
    id: "bp-blog-003",
    title: "What GSM Means — And Why It Matters for Your T-Shirt",
    slug: "what-gsm-means-tshirt-fabric",
    date: "2025-06-18",
    author: "The Burner Team",
    category: "education",
    tags: ["fabric", "quality", "GSM", "cotton"],
    coverImage: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80",
    excerpt: "You've seen the number on the tag. Here's what GSM actually tells you about the quality of a tee.",
    content: `
      <p>When you're buying a t-shirt online, GSM is one of the few numbers that actually tells you 
      something useful. Here's a plain-language guide.</p>
      
      <h2>What Is GSM?</h2>
      <p>GSM stands for Grams per Square Metre. It measures how heavy the fabric is per unit of area. 
      The higher the number, the heavier and thicker the fabric.</p>
      
      <h2>The GSM Ranges Explained</h2>
      <p><strong>100–150 GSM:</strong> Very lightweight. Great for hot weather but can feel flimsy. 
      Often used in cheap, fast-fashion tees.</p>
      
      <p><strong>160–180 GSM:</strong> The sweet spot for summer tees. Light enough to be comfortable, 
      heavy enough to hold its shape and not go transparent when stretched.</p>
      
      <p><strong>190–220 GSM:</strong> Mid-weight. Better drape, more structure, lasts longer. 
      This is where premium everyday tees live.</p>
      
      <p><strong>240 GSM and above:</strong> Heavyweight. More like a sweatshirt fabric. 
      Great for cooler weather or if you want a very substantial feel.</p>
      
      <h2>What We Use at Burner Pieces</h2>
      <p>Our cotton tees start at 200 GSM. We believe a tee should feel like something, 
      not float off your body the moment you put it on.</p>
      
      <p>Next time you're shopping for a tee, check the GSM. It's a fast way to judge 
      quality before you've even touched the fabric.</p>
    `,
    featured: false,
  },
];


/* ============================
   RENDER BLOG CARD
   Called by blog.html to render the grid of post cards.
   ============================ */
function renderBlogCard(post) {
  const dateFormatted = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return `
    <article class="blog-card" data-category="${post.category}">
      <a href="blog-post.html?id=${post.id}" class="blog-card-img-link">
        <div class="blog-card-img">
          <img src="${post.coverImage}" alt="${post.title}" loading="lazy">
          <span class="blog-category-badge">${post.category}</span>
        </div>
      </a>
      <div class="blog-card-body">
        <p class="blog-meta">${dateFormatted} &nbsp;·&nbsp; ${post.author}</p>
        <h3><a href="blog-post.html?id=${post.id}">${post.title}</a></h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <a href="blog-post.html?id=${post.id}" class="blog-read-more">
          Read More <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </article>
  `;
}

/* ============================
   RENDER BLOG GRID
   ============================ */
function renderBlogGrid(containerId, filter = 'all', limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let posts = filter === 'all'
    ? [...BLOG_POSTS]
    : BLOG_POSTS.filter(p => p.category === filter);

  // Most recent first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (limit) posts = posts.slice(0, limit);

  if (posts.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:40px;">No posts yet. Check back soon!</p>';
    return;
  }
  container.innerHTML = posts.map(renderBlogCard).join('');
}

/* ============================
   GET POST BY ID
   Used by blog-post.html to load a single post.
   ============================ */
function getBlogPostById(id) {
  return BLOG_POSTS.find(p => p.id === id);
}

/* ============================
   RENDER FULL BLOG POST
   Used inside blog-post.html
   ============================ */
function renderBlogPost(post) {
  const dateFormatted = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  // Populate page title
  document.title = `${post.title} | Burner Pieces`;

  // Hero image
  const hero = document.getElementById('postHeroImage');
  if (hero) hero.src = post.coverImage;

  // Meta
  const metaEl = document.getElementById('postMeta');
  if (metaEl) metaEl.innerHTML = `
    <span class="blog-category-badge">${post.category}</span>
    &nbsp; ${dateFormatted} &nbsp;·&nbsp; ${post.author}
  `;

  // Title
  const titleEl = document.getElementById('postTitle');
  if (titleEl) titleEl.textContent = post.title;

  // Content
  const contentEl = document.getElementById('postContent');
  if (contentEl) contentEl.innerHTML = post.content;

  // Tags
  const tagsEl = document.getElementById('postTags');
  if (tagsEl && post.tags) {
    tagsEl.innerHTML = post.tags.map(t =>
      `<span class="blog-tag">${t}</span>`
    ).join('');
  }
}
