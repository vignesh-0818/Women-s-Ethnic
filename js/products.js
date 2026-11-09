/**
 * VIRAASAT - Products Catalog Engine
 * Filtering (Categories, Subcategories, Price, Search), Sorting, URL Params & Dynamic Rendering
 * Only ONE single high-resolution image per card (NO hover image flip).
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.catalog-products-container')) return;

  initProductCatalog();
});

let currentFilters = {
  category: 'all',
  subcategory: 'all',
  search: '',
  maxPrice: 85000,
  sort: 'featured',
  size: 'all'
};

function initProductCatalog() {
  parseUrlParams();
  setupFilterControls();
  renderProducts();
}

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  const subcatParam = urlParams.get('subcategory');
  const searchParam = urlParams.get('search');

  if (catParam) {
    currentFilters.category = catParam.toLowerCase();
  }
  if (subcatParam) {
    currentFilters.subcategory = subcatParam;
  }
  if (searchParam) {
    currentFilters.search = searchParam.trim().toLowerCase();
    const searchInput = document.querySelector('.catalog-search-input');
    if (searchInput) searchInput.value = searchParam;
  }

  // Update active category tab in UI
  document.querySelectorAll('.category-tab-btn').forEach(btn => {
    const cat = btn.getAttribute('data-category');
    btn.classList.toggle('active', cat === currentFilters.category);
  });
}

function setupFilterControls() {
  // Mobile Filter Toggle Button
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const sidebarInner = document.getElementById('catalog-sidebar-inner');
  if (mobileFilterToggle && sidebarInner) {
    mobileFilterToggle.addEventListener('click', () => {
      const isExpanded = sidebarInner.classList.toggle('open');
      mobileFilterToggle.setAttribute('aria-expanded', isExpanded);
      const icon = mobileFilterToggle.querySelector('.filter-toggle-icon');
      if (icon) icon.style.transform = isExpanded ? 'rotate(180deg)' : 'none';
    });
  }

  // Category tabs
  document.querySelectorAll('.category-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.category = btn.getAttribute('data-category');
      currentFilters.subcategory = 'all';
      updateSubcategoryPills();
      renderProducts();
    });
  });

  // Search input
  const searchInput = document.querySelector('.catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  // Price range slider
  const priceSlider = document.querySelector('.price-range-input');
  const priceDisplay = document.querySelector('.price-max-display');
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', (e) => {
      currentFilters.maxPrice = Number(e.target.value);
      priceDisplay.textContent = `₹${currentFilters.maxPrice.toLocaleString('en-IN')}`;
      renderProducts();
    });
  }

  // Atelier Sizes Filter Buttons
  document.querySelectorAll('aside.catalog-sidebar .size-btn').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      const selectedSize = (btn.getAttribute('data-size') || btn.textContent).trim();
      if (currentFilters.size === selectedSize) {
        currentFilters.size = 'all';
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('aside.catalog-sidebar .size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.size = selectedSize;
      }
      renderProducts();
    });
  });

  // Sort dropdown
  const sortSelect = document.querySelector('.catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      renderProducts();
    });
  }

  // Reset filters buttons (sidebar button and empty-state button)
  document.querySelectorAll('.reset-filters-btn').forEach(btn => {
    btn.addEventListener('click', resetAllFilters);
  });

  updateSubcategoryPills();
}

function updateSubcategoryPills() {
  const container = document.querySelector('.subcategory-pills-container');
  if (!container) return;

  let subcats = [];
  if (currentFilters.category === 'kurtis') {
    subcats = ['Everyday', 'Designer', 'Embroidered', 'Casual & Office'];
  } else if (currentFilters.category === 'lehengas') {
    subcats = ['Bridal', 'Party wear', 'Festive', 'Designer'];
  } else if (currentFilters.category === 'suits') {
    subcats = ['Anarkali', 'Straight-cut', 'Palazzo', 'Embroidered'];
  } else {
    subcats = ['Bridal', 'Festive', 'Embroidered', 'Designer', 'Anarkali', 'Everyday'];
  }

  container.innerHTML = `
    <button class="subcat-pill ${currentFilters.subcategory === 'all' ? 'active' : ''}" data-subcat="all">All Styles</button>
    ${subcats.map(sub => `
      <button class="subcat-pill ${currentFilters.subcategory === sub ? 'active' : ''}" data-subcat="${sub}">${sub}</button>
    `).join('')}
  `;

  container.querySelectorAll('.subcat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.subcat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilters.subcategory = pill.getAttribute('data-subcat');
      renderProducts();
    });
  });
}

function renderProducts() {
  const container = document.querySelector('.catalog-products-container');
  const emptyState = document.querySelector('.catalog-empty-state');
  const countDisplay = document.querySelector('.catalog-count-display');
  if (!container) return;

  // Filter items
  let filtered = PRODUCTS_DATA.filter(item => {
    if (currentFilters.category !== 'all' && item.category !== currentFilters.category) {
      return false;
    }
    if (currentFilters.subcategory !== 'all' && item.subcategory.toLowerCase() !== currentFilters.subcategory.toLowerCase()) {
      return false;
    }
    if (item.price > currentFilters.maxPrice) {
      return false;
    }
    if (currentFilters.size !== 'all') {
      const targetSize = currentFilters.size.toLowerCase();
      const hasSize = item.sizes && item.sizes.some(s => {
        const sl = s.toLowerCase();
        if (targetSize === 'custom') return sl.includes('custom') || sl.includes('free');
        return sl === targetSize || sl.includes(targetSize);
      });
      if (!hasSize) return false;
    }
    if (currentFilters.search) {
      const q = currentFilters.search;
      const haystack = `${item.name} ${item.fabric} ${item.craft} ${item.subcategory} ${item.description}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort items
  if (currentFilters.sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentFilters.sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentFilters.sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (currentFilters.sort === 'newest') {
    filtered.reverse();
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${PRODUCTS_DATA.length} creations`;
  }

  if (filtered.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(item => createProductCardHtml(item)).join('');
    if (typeof updateWishlistCardIcons === 'function') {
      updateWishlistCardIcons();
    }
  }
}

function createProductCardHtml(product) {
  const isWishlisted = typeof Viraasat !== 'undefined' && Viraasat.wishlist.includes(product.id);
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Strictly ONLY ONE single image (no hoverImage flip)
  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-thumb-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-thumb-img" loading="lazy">
        
        ${product.badge ? `<span class="product-badge ${product.badge === 'Bestseller' ? 'gold' : ''}">${product.badge}</span>` : ''}

        <div class="product-actions-floating">
          <button class="product-action-icon wishlist-trigger-btn ${isWishlisted ? 'wishlist-active' : ''}" 
                  data-id="${product.id}" 
                  onclick="toggleWishlist('${product.id}')"
                  aria-label="Save to Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <button class="product-quick-view-btn" onclick="openQuickView('${product.id}')">
          Quick View
        </button>
      </div>

      <div class="product-info-box">
        <div class="product-category-label">${product.category.toUpperCase()} • ${product.subcategory}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-fabric-hint">${product.fabric}</div>
        
        <div class="product-rating-row">
          <span>★ ★ ★ ★ ★</span>
          <span style="font-weight:600; color:var(--color-text);">${product.rating}</span>
          <span class="product-reviews-num">(${product.reviewsCount})</span>
        </div>

        <div class="product-price-row">
          <span class="product-price-current">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.originalPrice ? `<span class="product-price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          ${discountPercent > 0 ? `<span class="product-discount-tag">${discountPercent}% OFF</span>` : ''}
        </div>

        <button class="btn btn-outline product-add-cart-btn" onclick="addToCart('${product.id}', 'M', '${product.color}')">
          Add to Bag
        </button>
      </div>
    </article>
  `;
}

function resetAllFilters() {
  currentFilters = {
    category: 'all',
    subcategory: 'all',
    search: '',
    maxPrice: 85000,
    sort: 'featured',
    size: 'all'
  };

  // Reset category tabs
  document.querySelectorAll('.category-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
  });

  // Reset size filter buttons
  document.querySelectorAll('.atelier-sizes-filter .size-btn, aside.catalog-sidebar .size-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Reset search input
  const searchInput = document.querySelector('.catalog-search-input');
  if (searchInput) searchInput.value = '';

  // Reset price slider and text display
  const priceSlider = document.querySelector('.price-range-input');
  const priceDisplay = document.querySelector('.price-max-display');
  if (priceSlider && priceDisplay) {
    priceSlider.value = 85000;
    priceDisplay.textContent = '₹85,000';
  }

  // Reset sort dropdown
  const sortSelect = document.querySelector('.catalog-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  // Clean URL query parameters smoothly without reloading
  if (window.history && window.history.replaceState) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // Restore subcategory pills to default
  updateSubcategoryPills();

  // Re-render full products collection and hide empty state
  renderProducts();
}
