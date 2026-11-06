/**
 * VIRAASAT - Women's Ethnic Wear Boutique
 * Main Application Logic: Navigation, Theme Toggle, RTL, Wishlist, Cart Drawer, Quick View & Toasts
 */

// --- Global State Management ---
const Viraasat = {
  theme: localStorage.getItem('viraasat_theme') || 'light',
  direction: localStorage.getItem('viraasat_dir') || 'ltr',
  wishlist: JSON.parse(localStorage.getItem('viraasat_wishlist') || '[]'),
  cart: JSON.parse(localStorage.getItem('viraasat_cart') || '[]')
};

// --- Initialization on DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDirection();
  initHeader();
  initSearch();
  initWishlist();
  initCart();
  initQuickViewModal();
  initMobileNav();
  initNewsletterForms();
  renderDynamicBadges();
});

// --- Theme Management (Light / Dark) ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', Viraasat.theme);
  updateThemeToggleButtons();

  const themeBtns = document.querySelectorAll('.mode-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      Viraasat.theme = Viraasat.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', Viraasat.theme);
      localStorage.setItem('viraasat_theme', Viraasat.theme);
      updateThemeToggleButtons();
      // Toast notification suppressed per user request
    });
  });
}

function updateThemeToggleButtons() {
  const isDark = Viraasat.theme === 'dark';
  document.querySelectorAll('.header-actions .mode-toggle-btn').forEach(btn => {
    btn.innerHTML = isDark ? `<span>☀️</span>` : `<span>🌙</span>`;
    btn.setAttribute('aria-label', `Switch to ${isDark ? 'Light' : 'Dark'} mode`);
    btn.setAttribute('title', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
  });
  document.querySelectorAll('.mobile-nav-drawer .mode-toggle-btn').forEach(btn => {
    btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  });
}

// --- Direction Management (LTR / RTL) ---
function initDirection() {
  document.documentElement.setAttribute('dir', Viraasat.direction);
  updateRtlToggleButtons();

  const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');
  rtlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      Viraasat.direction = Viraasat.direction === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', Viraasat.direction);
      localStorage.setItem('viraasat_dir', Viraasat.direction);
      updateRtlToggleButtons();
    });
  });
}

function updateRtlToggleButtons() {
  const isRtl = Viraasat.direction === 'rtl';
  document.querySelectorAll('.header-actions .rtl-toggle-btn').forEach(btn => {
    btn.innerHTML = `<span class="btn-text">${isRtl ? 'LTR' : 'RTL'}</span>`;
    btn.setAttribute('aria-label', `Switch to ${isRtl ? 'Left to Right' : 'Right to Left'}`);
    btn.setAttribute('title', `Switch to ${isRtl ? 'LTR' : 'RTL'}`);
  });
  document.querySelectorAll('.mobile-nav-drawer .rtl-toggle-btn').forEach(btn => {
    btn.textContent = isRtl ? 'Switch to LTR' : 'Switch to RTL';
  });
}

// --- Header & Scroll Effects ---
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Header spacer element for layout stabilization
  let headerSpacer = document.querySelector('.site-header-spacer');
  if (!headerSpacer && header.parentNode) {
    headerSpacer = document.createElement('div');
    headerSpacer.className = 'site-header-spacer';
    headerSpacer.style.display = 'none';
    header.parentNode.insertBefore(headerSpacer, header.nextSibling);
  }

  function updateHeaderSticky() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    
    // Add shadow when scrolled
    if (scrollY > 15) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Dynamic fallback to guarantee sticky navbar across any browser/webview
    const rect = header.getBoundingClientRect();
    if (scrollY > 0 && rect.top < 0) {
      header.classList.add('is-fixed-sticky');
      if (headerSpacer) {
        headerSpacer.style.height = `${header.offsetHeight}px`;
        headerSpacer.style.display = 'block';
      }
    } else if (scrollY === 0) {
      header.classList.remove('is-fixed-sticky');
      if (headerSpacer) {
        headerSpacer.style.display = 'none';
      }
    }
  }

  window.addEventListener('scroll', updateHeaderSticky, { passive: true });
  window.addEventListener('resize', updateHeaderSticky, { passive: true });
  updateHeaderSticky();

  // Highlight active navigation link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// --- Mobile Navigation ---
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.mobile-nav-close');
  const homeToggle = document.querySelector('.mobile-home-toggle');
  const homeSublist = document.querySelector('.mobile-home-sublist');

  if (!hamburger || !drawer) return;

  const toggleNav = (open) => {
    drawer.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggleNav(!drawer.classList.contains('open')));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleNav(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleNav(false));

  if (homeToggle && homeSublist) {
    homeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      homeSublist.classList.toggle('open');
      const icon = homeToggle.querySelector('.nav-chevron');
      if (icon) icon.style.transform = homeSublist.classList.contains('open') ? 'rotate(180deg)' : 'none';
    });
  }

  // Close menu when any navigation link is selected
  drawer.querySelectorAll('.mobile-nav-link:not(.mobile-home-toggle), .mobile-nav-sublink').forEach(link => {
    link.addEventListener('click', () => {
      toggleNav(false);
    });
  });
}

// --- Slide-Down Search Overlay ---
function initSearch() {
  const searchBtn = document.querySelector('.search-toggle-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchClose = document.querySelector('.search-close-btn');
  const searchForm = document.querySelector('.search-form-inner');
  const searchInput = document.querySelector('.search-input-field');

  if (!searchBtn || !searchOverlay) return;

  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('open');
    if (searchOverlay.classList.contains('open') && searchInput) {
      searchInput.focus();
    }
  });

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('open');
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchOverlay.classList.remove('open');
      closeDrawers();
      closeModal();
    }
  });
}

// --- Wishlist System ---
function initWishlist() {
  const wishlistBtn = document.querySelector('.wishlist-toggle-btn');
  const wishlistDrawer = document.querySelector('.wishlist-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.wishlist-close-btn');

  if (wishlistBtn && wishlistDrawer) {
    wishlistBtn.addEventListener('click', () => {
      renderWishlistDrawer();
      wishlistDrawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawers);
  }
}

function toggleWishlist(productId) {
  const index = Viraasat.wishlist.indexOf(productId);
  let added = false;
  if (index > -1) {
    Viraasat.wishlist.splice(index, 1);
  } else {
    Viraasat.wishlist.push(productId);
    added = true;
  }

  localStorage.setItem('viraasat_wishlist', JSON.stringify(Viraasat.wishlist));
  renderDynamicBadges();
  updateWishlistCardIcons();
  renderWishlistDrawer();

  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const name = product ? product.name : 'Item';
  showToast(added ? `Added "${name}" to your Wishlist` : `Removed "${name}" from Wishlist`);
}

function updateWishlistCardIcons() {
  document.querySelectorAll('.wishlist-trigger-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    const isWishlisted = Viraasat.wishlist.includes(id);
    btn.classList.toggle('wishlist-active', isWishlisted);
  });
}

function renderWishlistDrawer() {
  const container = document.querySelector('.wishlist-items-container');
  if (!container) return;

  if (Viraasat.wishlist.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty-msg">
        <p style="font-size:2rem; margin-bottom:12px;">♡</p>
        <p style="font-family:var(--font-serif); font-size:1.15rem; margin-bottom:8px;">Your Wishlist is Empty</p>
        <p style="font-size:0.85rem; color:var(--color-text-muted);">Save your favorite sarees, lehengas, and kurtis to curate your royal collection.</p>
        <a href="products.html" class="btn btn-outline btn-sm" style="margin-top:20px;">Explore Collection</a>
      </div>
    `;
    return;
  }

  const itemsHtml = Viraasat.wishlist.map(id => {
    const item = PRODUCTS_DATA.find(p => p.id === id);
    if (!item) return '';
    return `
      <div class="drawer-item-card">
        <img src="${item.image}" alt="${item.name}" class="drawer-item-thumb">
        <div style="flex:1;">
          <h4 class="drawer-item-title">${item.name}</h4>
          <div class="drawer-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div style="display:flex; gap:12px; margin-top:8px;">
            <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}', 'M', '${item.color || ''}'); toggleWishlist('${item.id}')">Add to Bag</button>
            <span class="drawer-item-remove" onclick="toggleWishlist('${item.id}')">Remove</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = itemsHtml;
}

// --- Cart System ---
function initCart() {
  const cartBtn = document.querySelector('.cart-toggle-btn');
  const cartDrawer = document.querySelector('.cart-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.cart-close-btn');
  const checkoutBtn = document.querySelector('.cart-checkout-btn');

  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', () => {
      renderCartDrawer();
      cartDrawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawers);
  if (backdrop) backdrop.addEventListener('click', closeDrawers);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (Viraasat.cart.length === 0) {
        showToast('Your shopping bag is currently empty.');
        return;
      }
      // Navigate to dedicated Checkout Page
      window.location.href = 'checkout.html';
    });
  }
}

function addToCart(productId, size = 'M', color = '') {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const selectedColor = color || (product ? product.color : '');

  const existing = Viraasat.cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.quantity += 1;
    if (!existing.color && selectedColor) existing.color = selectedColor;
  } else {
    Viraasat.cart.push({ id: productId, size: size, color: selectedColor, quantity: 1 });
  }

  localStorage.setItem('viraasat_cart', JSON.stringify(Viraasat.cart));
  renderDynamicBadges();
  renderCartDrawer();

  showToast(`Added ${product ? product.name : 'Item'} (Size: ${size}) to Shopping Bag`);
}

function updateCartQty(productId, size, change) {
  const itemIndex = Viraasat.cart.findIndex(item => item.id === productId && item.size === size);
  if (itemIndex > -1) {
    Viraasat.cart[itemIndex].quantity += change;
    if (Viraasat.cart[itemIndex].quantity <= 0) {
      Viraasat.cart.splice(itemIndex, 1);
    }
  }
  localStorage.setItem('viraasat_cart', JSON.stringify(Viraasat.cart));
  renderDynamicBadges();
  renderCartDrawer();
}

function renderCartDrawer() {
  const container = document.querySelector('.cart-items-container');
  const totalDisplay = document.querySelector('.cart-subtotal-val');
  if (!container) return;

  if (Viraasat.cart.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty-msg">
        <p style="font-size:2rem; margin-bottom:12px;">🛍️</p>
        <p style="font-family:var(--font-serif); font-size:1.15rem; margin-bottom:8px;">Your Bag is Empty</p>
        <p style="font-size:0.85rem; color:var(--color-text-muted);">Discover bespoke lehengas, graceful anarkalis, and pure silk kurtas.</p>
        <a href="products.html" class="btn btn-primary btn-sm" style="margin-top:20px;">Start Shopping</a>
      </div>
    `;
    if (totalDisplay) totalDisplay.textContent = '₹0';
    return;
  }

  let subtotal = 0;
  const itemsHtml = Viraasat.cart.map(cartItem => {
    const item = PRODUCTS_DATA.find(p => p.id === cartItem.id);
    if (!item) return '';
    const itemTotal = item.price * cartItem.quantity;
    subtotal += itemTotal;

    return `
      <div class="drawer-item-card">
        <img src="${item.image}" alt="${item.name}" class="drawer-item-thumb">
        <div style="flex:1;">
          <h4 class="drawer-item-title">${item.name}</h4>
          <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:4px;">
            Size: <strong>${cartItem.size}</strong> ${cartItem.color ? `• Shade: ${cartItem.color}` : ''}
          </div>
          <div class="drawer-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div style="display:flex; align-items:center; gap:12px; margin-top:10px;">
            <div style="display:flex; align-items:center; border:1px solid var(--color-border); border-radius:var(--radius-sm);">
              <button style="padding:2px 8px;" onclick="updateCartQty('${cartItem.id}', '${cartItem.size}', -1)">-</button>
              <span style="padding:0 8px; font-size:0.85rem; font-weight:600;">${cartItem.quantity}</span>
              <button style="padding:2px 8px;" onclick="updateCartQty('${cartItem.id}', '${cartItem.size}', 1)">+</button>
            </div>
            <span class="drawer-item-remove" onclick="updateCartQty('${cartItem.id}', '${cartItem.size}', -${cartItem.quantity})">Remove</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = itemsHtml;
  if (totalDisplay) totalDisplay.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}

function closeDrawers() {
  document.querySelectorAll('.side-drawer, .mobile-nav-drawer').forEach(d => d.classList.remove('open'));
  const backdrop = document.querySelector('.drawer-backdrop');
  if (backdrop) backdrop.classList.remove('open');
  const hamburger = document.querySelector('.hamburger-btn');
  if (hamburger) hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Dynamic Header Badges (Wishlist & Cart Counts) ---
function renderDynamicBadges() {
  const wishlistBadge = document.querySelector('.wishlist-badge');
  const cartBadge = document.querySelector('.cart-badge');

  const wishlistCount = Viraasat.wishlist.length;
  const cartCount = Viraasat.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistCount;
    wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }

  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
  }
}

// --- Quick View Modal System (Strictly ONE Image with Perfect Alignment) ---
function initQuickViewModal() {
  const modal = document.querySelector('.quickview-modal');
  const closeBtn = document.querySelector('.modal-close-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function openQuickView(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const modal = document.querySelector('.quickview-modal');
  const container = document.querySelector('.quickview-body');
  if (!product || !modal || !container) return;

  let selectedSize = product.sizes && product.sizes.length ? product.sizes[0] : 'Free Size';

  // Strictly ONLY ONE image with proper alignment, NO secondary thumbnail switcher
  container.innerHTML = `
    <div class="quickview-grid">
      <div class="quickview-single-image-wrap" style="display:flex; justify-content:center; align-items:center;">
        <img src="${product.image}" alt="${product.name}" class="quickview-img" style="width:100%; max-height:460px; object-fit:cover; border-radius:var(--radius-sm); box-shadow:var(--shadow-md);">
      </div>
      <div class="quickview-info">
        <div class="section-tag" style="margin-bottom:6px;">${product.category.toUpperCase()} • ${product.subcategory}</div>
        <h2>${product.name}</h2>
        <div class="product-rating-row">
          <span>★ ★ ★ ★ ★</span>
          <span style="font-weight:600; color:var(--color-text);">${product.rating}</span>
          <span class="product-reviews-num">(${product.reviewsCount} verified reviews)</span>
        </div>
        <div class="quickview-price-row">
          <span class="product-price-current">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.originalPrice ? `<span class="product-price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          ${product.badge ? `<span class="product-badge" style="position:static;">${product.badge}</span>` : ''}
        </div>
        <p style="font-size:0.95rem; color:var(--color-text-secondary); line-height:1.7; margin-bottom:18px;">
          ${product.description}
        </p>
        <div style="font-size:0.85rem; margin-bottom:14px; background:var(--bg-secondary); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--color-border-light);">
          <div><strong>Fabric:</strong> ${product.fabric}</div>
          <div style="margin-top:4px;"><strong>Craftsmanship:</strong> ${product.craft}</div>
          <div style="margin-top:4px;"><strong>Shade:</strong> ${product.color}</div>
        </div>

        <div class="size-selector-row">
          <span class="size-selector-label">Select Size:</span>
          <div class="size-btn-group" id="quickview-sizes">
            ${product.sizes.map((s, idx) => `
              <button class="size-btn ${idx === 0 ? 'active' : ''}" onclick="selectModalSize(this, '${s}')">${s}</button>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:14px; margin-top:24px;">
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="addToCart('${product.id}', window.currentQuickViewSize || '${selectedSize}', '${product.color}'); closeModal();">
            Add to Bag
          </button>
          <button class="btn btn-outline" onclick="toggleWishlist('${product.id}')">
            ♡ Wishlist
          </button>
        </div>
      </div>
    </div>
  `;

  window.currentQuickViewSize = selectedSize;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectModalSize(btn, size) {
  document.querySelectorAll('#quickview-sizes .size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.currentQuickViewSize = size;
}

function closeModal() {
  const modal = document.querySelector('.quickview-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// --- Newsletter Forms ---
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value && input.checkValidity()) {
        showToast('Subscribed! Check your inbox for your 15% VIP welcome code.');
        input.value = '';
      } else {
        showToast('Please enter a valid email address.');
      }
    });
  });
}

// --- Toast Notification Display ---
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
