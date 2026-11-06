/**
 * VIRAASAT - Blog & Editorial Engine
 * Category Filtering, Search, Article Details Loader & Interactive Comments Mockup
 */

document.addEventListener('DOMContentLoaded', () => {
  // If on blog listing page
  if (document.querySelector('.blog-listing-container')) {
    initBlogListing();
  }

  // If on single blog details page
  if (document.querySelector('.article-single-page')) {
    initBlogDetails();
  }
});

let currentBlogCategory = 'all';
let currentBlogSearch = '';

function initBlogListing() {
  setupBlogFilters();
  renderBlogList();
}

function setupBlogFilters() {
  document.querySelectorAll('.blog-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBlogCategory = btn.getAttribute('data-category');
      renderBlogList();
    });
  });

  const searchInput = document.querySelector('.blog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentBlogSearch = e.target.value.trim().toLowerCase();
      renderBlogList();
    });
  }
}

function renderBlogList() {
  const container = document.querySelector('.blog-listing-container');
  const emptyState = document.querySelector('.blog-empty-state');
  if (!container) return;

  const filtered = BLOGS_DATA.filter(article => {
    if (currentBlogCategory !== 'all' && article.category.toLowerCase() !== currentBlogCategory.toLowerCase()) {
      return false;
    }
    if (currentBlogSearch) {
      const haystack = `${article.title} ${article.summary} ${article.author} ${article.category}`.toLowerCase();
      if (!haystack.includes(currentBlogSearch)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(article => `
      <article class="blog-card" data-article-id="${article.id}">
        <div class="blog-thumb-frame">
          <img src="${article.image}" alt="${article.title}" class="blog-thumb-img blog-img-${article.id}" loading="lazy">
          <span class="blog-category-chip">${article.category}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-meta-row">
            <span>By ${article.author}</span>
            <span>•</span>
            <span>${article.date}</span>
            <span>•</span>
            <span>${article.readTime}</span>
          </div>
          <h3 class="blog-card-title">${article.title}</h3>
          <p class="blog-card-summary">${article.summary}</p>
          <a href="blog-details.html?id=${article.id}" class="blog-read-more-link">
            Read Full Article <span>→</span>
          </a>
        </div>
      </article>
    `).join('');
  }
}

// --- Single Blog Details Page Loader ---
function initBlogDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id') || 'choosing-wedding-lehenga';
  const article = BLOGS_DATA.find(b => b.id === articleId) || BLOGS_DATA[0];

  // Set document title
  document.title = `${article.title} | VIRAASAT Journal`;

  // Populate hero & meta
  const titleEl = document.querySelector('.article-single-title');
  const catEl = document.querySelector('.article-single-cat');
  const metaEl = document.querySelector('.article-single-meta');
  const heroImgEl = document.querySelector('.article-single-hero-img');
  const contentEl = document.querySelector('.article-single-content');

  if (titleEl) titleEl.textContent = article.title;
  if (catEl) catEl.textContent = article.category.toUpperCase();
  if (metaEl) {
    metaEl.innerHTML = `
      <span>By <strong>${article.author}</strong> (${article.authorRole})</span>
      <span style="margin: 0 8px;">•</span>
      <span>${article.date}</span>
      <span style="margin: 0 8px;">•</span>
      <span>${article.readTime}</span>
    `;
  }
  if (heroImgEl) {
    heroImgEl.src = article.image;
    heroImgEl.alt = article.title;
  }
  if (contentEl) {
    contentEl.innerHTML = article.content;
  }

  // Related articles
  renderRelatedArticles(article.id);

  // Comment submission mockup
  initCommentForm();
}

function renderRelatedArticles(currentId) {
  const container = document.querySelector('.related-articles-container');
  if (!container) return;

  const related = BLOGS_DATA.filter(b => b.id !== currentId).slice(0, 3);
  container.innerHTML = related.map(article => `
    <article class="blog-card">
      <div class="blog-thumb-frame">
        <img src="${article.image}" alt="${article.title}" class="blog-thumb-img" loading="lazy">
        <span class="blog-category-chip">${article.category}</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-meta-row">
          <span>${article.date}</span>
          <span>•</span>
          <span>${article.readTime}</span>
        </div>
        <h4 class="blog-card-title">${article.title}</h4>
        <p class="blog-card-summary">${article.summary}</p>
        <a href="blog-details.html?id=${article.id}" class="blog-read-more-link">
          Read Guide <span>→</span>
        </a>
      </div>
    </article>
  `).join('');
}

function initCommentForm() {
  const form = document.querySelector('.article-comment-form');
  const commentsList = document.querySelector('.article-comments-list');
  if (!form || !commentsList) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#comment-name');
    const msgInput = form.querySelector('#comment-msg');

    if (!nameInput.value.trim() || !msgInput.value.trim()) {
      if (typeof showToast === 'function') showToast('Please enter your name and thoughts.');
      return;
    }

    const newComment = document.createElement('div');
    newComment.style.cssText = 'padding:18px; background:var(--bg-secondary); border-radius:var(--radius-sm); margin-bottom:16px; border:1px solid var(--color-border-light);';
    newComment.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <strong style="color:var(--color-primary); font-size:0.95rem;">${nameInput.value.trim()}</strong>
        <span style="font-size:0.75rem; color:var(--color-text-muted);">Just now</span>
      </div>
      <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.6;">${msgInput.value.trim()}</p>
    `;

    commentsList.prepend(newComment);
    if (typeof showToast === 'function') showToast('Thank you! Your comment has been shared.');
    nameInput.value = '';
    msgInput.value = '';
  });
}

