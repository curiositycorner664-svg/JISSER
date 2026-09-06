const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Given a product's pricing tiers and an order quantity, find the correct
// per-unit price (the highest min_quantity tier the order quantity qualifies for).
function resolveUnitPrice(basePrice, tiers, quantity) {
  let price = Number(basePrice);
  for (const tier of tiers) {
    if (quantity >= tier.min_quantity) {
      price = Number(tier.unit_price);
    }
  }
  return price;
}

// Place an order. Body: { items: [{ productId, quantity }], notes }
// Validates MOQ, stock, computes tiered pricing server-side (never trust
// client-submitted prices), and enforces the buyer's credit limit for
// net-terms accounts.
router.post('/', requireAuth, async (req, res) => {
  const { items, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const user = userRes.rows[0];
    if (!user || user.status !== 'approved') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Account not approved for ordering' });
    }

    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const productRes = await client.query('SELECT * FROM products WHERE id = $1 AND active = true', [
        item.productId,
      ]);
      const product = productRes.rows[0];
      if (!product) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      if (item.quantity < product.moq) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `${product.name} has a minimum order quantity of ${product.moq}`,
        });
      }
      if (item.quantity > product.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }

      const tiersRes = await client.query(
        'SELECT min_quantity, unit_price FROM pricing_tiers WHERE product_id = $1 ORDER BY min_quantity ASC',
        [product.id]
      );
      const unitPrice = resolveUnitPrice(product.base_price, tiersRes.rows, item.quantity);
      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));

      subtotal += lineTotal;
      lineItems.push({ productId: product.id, quantity: item.quantity, unitPrice, lineTotal });
    }

    subtotal = Number(subtotal.toFixed(2));
    const total = subtotal; // add tax/shipping calculation here if needed

    // Credit limit check only applies to non-prepaid (net terms) accounts.
    if (user.payment_terms !== 'prepaid') {
      const availableCredit = Number(user.credit_limit) - Number(user.credit_used);
      if (total > availableCredit) {
        await client.query('ROLLBACK');
        return res.status(402).json({
          error: `Order total $${total} exceeds available credit of $${availableCredit.toFixed(2)}`,
        });
      }
    }

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, status, payment_terms, subtotal, total, notes)
       VALUES ($1, 'confirmed', $2, $3, $4, $5) RETURNING *`,
      [user.id, user.payment_terms, subtotal, total, notes || null]
    );
    const order = orderRes.rows[0];

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, li.productId, li.quantity, li.unitPrice, li.lineTotal]
      );
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [
        li.quantity,
        li.productId,
      ]);
    }

    if (user.payment_terms !== 'prepaid') {
      await client.query('UPDATE users SET credit_used = credit_used + $1 WHERE id = $2', [total, user.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ order, items: lineItems });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

// Order history for the logged-in buyer.
router.get('/', requireAuth, async (req, res) => {
  try {
    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(ordersRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Single order detail with line items (owner or admin only).
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    const itemsRes = await pool.query(
      `SELECT oi.*, p.name, p.sku FROM order_items oi
       JOIN products p ON p.id = oi.product_id WHERE order_id = $1`,
      [req.params.id]
    );

    res.json({ ...order, items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Admin: view all orders, update order status
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT o.*, u.company_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`
  );
  res.json(result.rows);
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'shipped', 'paid', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
    status,
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

module.exports = router;
