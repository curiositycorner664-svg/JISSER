// Adds an item to the local cart (or bumps its quantity if already present).
function addToCart(productId, name, quantity, unitPrice, moq) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name, quantity, unitPrice, moq });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.productId !== productId));
  renderCartPage();
}

function updateCartQty(productId, quantity) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) item.quantity = Math.max(item.moq, Number(quantity) || item.moq);
  saveCart(cart);
  renderCartPage();
}

// Renders the cart as a "packing slip" on cart.html. unitPrice shown is
// indicative (base tier) — the server recalculates the real tiered price
// at checkout, so this total is always labeled as an estimate.
function renderCartPage() {
  const container = document.getElementById('cart-container');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="slip-head">${tn('packing_slip_count', 0)}</div>
      <div style="padding:1.5rem;">${t('crate_empty')} <a href="/index.html">${t('browse_catalog_link')}</a>.</div>`;
    return;
  }

  let total = 0;
  const rows = cart
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      total += lineTotal;
      return `
        <div class="cart-row">
          <div>
            <strong>${item.name}</strong><br/>
            <span style="color:var(--steel); font-size:0.82rem;">${t('moq_label', { moq: item.moq })}</span>
          </div>
          <input type="number" class="qty-input" min="${item.moq}" value="${item.quantity}"
            onchange="updateCartQty(${item.productId}, this.value)" />
          <span>$${lineTotal.toFixed(2)}</span>
          <button class="danger" onclick="removeFromCart(${item.productId})">${t('remove')}</button>
        </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="slip-head">${tn('packing_slip_count', cart.length)}</div>
    ${rows}
    <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.1rem;">
      <span style="font-size:0.8rem; color:var(--steel);">${t('final_pricing_note')}</span>
      <strong style="font-family:'Oswald',sans-serif; font-size:1.2rem;">${t('est_total', { amount: total.toFixed(2) })}</strong>
    </div>
    <div style="padding: 0 1.1rem 1.1rem; text-align:right;">
      <a href="/checkout.html" class="btn">${t('proceed_checkout')}</a>
    </div>
  `;
}
