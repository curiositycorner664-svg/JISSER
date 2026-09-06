// Small fetch wrapper: attaches the JWT token and base URL for every call.
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-Lang': getLang(), ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
  }
  return data;
}

const CRATE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>
</svg>`;

const CATEGORIES = ['Apparel', 'Housewares', 'Bags', 'Electronics'];

// Builds the full header (wordmark, search, account links, cart) plus the
// category strip below it, and injects both into #site-header-root.
// Call once on every page after the DOM has the placeholder div.
const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

function renderNav() {
  const user = getUser();
  const root = document.getElementById('site-header-root');
  if (!root) return;

  const accountLinks = user
    ? `<a href="/orders.html">${t('nav_my_orders')}</a>
       ${user.role === 'admin' ? `<a href="/admin.html">${t('nav_admin')}</a>` : ''}
       <span style="opacity:0.75;">${user.companyName}</span>
       <a href="#" onclick="logout(); return false;">${t('nav_log_out')}</a>`
    : `<a href="/login.html">${t('nav_log_in')}</a>
       <a href="/register.html">${t('nav_register')}</a>`;

  const currentLang = getLang();
  const langSwitcher = `
    <select class="lang-switch" onchange="setLang(this.value); location.reload();" aria-label="Language">
      ${LANGUAGES.map((l) => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.label}</option>`).join('')}
    </select>`;

  root.innerHTML = `
    <header class="site-header">
      <div class="header-top">
        <a href="/index.html" class="wordmark"><img src="/img/logo.png" alt="JISSER" class="wordmark-img" /><span class="sub">${t('tagline')}</span></a>
        <form class="search-bar" onsubmit="event.preventDefault(); window.location.href='/index.html?search='+encodeURIComponent(this.q.value);">
          <input name="q" type="text" placeholder="${t('nav_search_placeholder')}" />
          <button type="submit">${t('nav_search_btn')}</button>
        </form>
        <nav class="top-links">
          ${accountLinks}
          <a href="/cart.html" class="crate-cart">${CRATE_ICON}<span class="cart-badge" id="cart-count">0</span></a>
          ${langSwitcher}
        </nav>
      </div>
    </header>
    <div class="category-strip">
      <div class="strip-inner">
        <a href="/index.html">${t('nav_all_products')}</a>
        ${CATEGORIES.map((c) => `<a href="/index.html?category=${encodeURIComponent(c)}">${tCategory(c)}</a>`).join('')}
      </div>
    </div>
  `;
  updateCartCount();

  const footer = document.querySelector('.site-footer');
  if (footer) footer.textContent = t('footer');
}

function updateCartCount() {
  const cart = getCart();
  const el = document.getElementById('cart-count');
  if (el) el.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
