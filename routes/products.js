const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Resolves the requested UI language to one of our supported codes, reading
// either the ?lang= query param or the X-Lang header the frontend sends on
// every request. Falls back to English for anything unrecognized.
const SUPPORTED_LANGS = ['en', 'fr', 'ar'];
function resolveLang(req) {
  const lang = (req.query.lang || req.headers['x-lang'] || 'en').toString().toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
}

// Builds the SELECT expressions that pick the translated name/description
// for the resolved language, falling back to the English column whenever a
// translation is missing (e.g. a product added without translations yet).
function localizedColumns(lang) {
  if (lang === 'en') {
    return { name: 'p.name', description: 'p.description' };
  }
  return {
    name: `COALESCE(NULLIF(p.name_${lang}, ''), p.name)`,
    description: `COALESCE(NULLIF(p.description_${lang}, ''), p.description)`,
  };
}

// Public catalog listing (buyers must still log in to see wholesale pricing
// tiers in most B2B setups, but we expose base_price + moq openly here so
// visitors can browse; tier pricing is included for logged-out users too
// since it's not sensitive — adjust to taste).
router.get('/', async (req, res) => {
  try {
    const { category, search, seller } = req.query;
    const lang = resolveLang(req);
    const cols = localizedColumns(lang);
    const conditions = ['p.active = true'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      // Match against the name in any language so search still works
      // regardless of which language the catalog is currently displayed in.
      conditions.push(`(p.name ILIKE $${params.length} OR p.name_fr ILIKE $${params.length} OR p.name_ar ILIKE $${params.length})`);
    }
    if (seller) {
      params.push(seller);
      conditions.push(`s.name = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT p.id, p.sku, ${cols.name} AS name, ${cols.description} AS description, p.category, p.base_price, p.moq, p.stock_quantity, p.image_url,
              s.id AS seller_id, s.name AS seller_name, s.rating AS seller_rating, s.verified AS seller_verified
       FROM products p LEFT JOIN sellers s ON s.id = p.seller_id
       ${where} ORDER BY p.name ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Single product with its full bulk-pricing tier list and seller profile.
router.get('/:id', async (req, res) => {
  try {
    const lang = resolveLang(req);
    const cols = localizedColumns(lang);
    const productRes = await pool.query(
      `SELECT p.id, p.seller_id, p.sku, ${cols.name} AS name, ${cols.description} AS description,
              p.category, p.base_price, p.moq, p.stock_quantity, p.image_url, p.active, p.created_at,
              s.name AS seller_name, s.location AS seller_location, s.rating AS seller_rating,
              s.review_count AS seller_review_count, s.since_year AS seller_since_year, s.verified AS seller_verified
       FROM products p LEFT JOIN sellers s ON s.id = p.seller_id
       WHERE p.id = $1 AND p.active = true`,
      [req.params.id]
    );
    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const tiersRes = await pool.query(
      'SELECT min_quantity, unit_price FROM pricing_tiers WHERE product_id = $1 ORDER BY min_quantity ASC',
      [req.params.id]
    );

    res.json({ ...productRes.rows[0], pricingTiers: tiersRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// --- Admin-only management ---

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { sku, name, description, category, base_price, moq, stock_quantity, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (sku, name, description, category, base_price, moq, stock_quantity, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [sku, name, description, category, base_price, moq || 1, stock_quantity || 0, image_url || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.post('/:id/pricing-tiers', requireAuth, requireAdmin, async (req, res) => {
  const { min_quantity, unit_price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pricing_tiers (product_id, min_quantity, unit_price) VALUES ($1,$2,$3)
       ON CONFLICT (product_id, min_quantity) DO UPDATE SET unit_price = EXCLUDED.unit_price
       RETURNING *`,
      [req.params.id, min_quantity, unit_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add pricing tier' });
  }
});

// Removes a product from the catalog. This is a soft delete (active = false)
// rather than a row delete: past orders still reference this product_id via
// order_items, and a hard DELETE would either fail on that foreign key or,
// worse, silently corrupt historical order records. Soft-deleted products
// are simply excluded from the public listing/detail queries above.
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE products SET active = false WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove product' });
  }
});

module.exports = router;
