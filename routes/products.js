const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin, requireAdminOrSeller } = require('../middleware/auth');

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

// A seller's own catalog — active AND inactive listings, so they can see
// (and re-activate) things they've taken down. Admins hitting this see
// every product in the system, since they don't have their own storefront.
// Must be registered before GET /:id or Express would treat "mine" as an id.
router.get('/mine', requireAuth, requireAdminOrSeller, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !req.user.sellerId) {
      return res.status(403).json({ error: 'No storefront is associated with this account' });
    }

    const result = await pool.query(
      `SELECT p.id, p.sku, p.name, p.category, p.base_price, p.moq, p.stock_quantity, p.image_url, p.active, p.created_at,
              s.id AS seller_id, s.name AS seller_name
       FROM products p LEFT JOIN sellers s ON s.id = p.seller_id
       ${isAdmin ? '' : 'WHERE p.seller_id = $1'}
       ORDER BY p.created_at DESC`,
      isAdmin ? [] : [req.user.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your products' });
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

// --- Seller & admin management ---
// Sellers manage only their own storefront's products; admins can manage
// anything (and can optionally assign a product to a seller_id directly,
// e.g. to fix a mis-listed item).

// Loads a product's seller_id and checks the requester is allowed to touch
// it: admins always are, sellers only for products under their own seller_id.
// Returns the product row on success, or sends the error response and
// returns null on failure — callers should just `if (!product) return;`.
async function loadOwnedProduct(req, res) {
  const result = await pool.query('SELECT id, seller_id FROM products WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  const product = result.rows[0];
  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.role === 'seller' && req.user.sellerId && product.seller_id === req.user.sellerId;
  if (!isAdmin && !isOwner) {
    res.status(403).json({ error: 'You can only manage your own products' });
    return null;
  }
  return product;
}

router.post('/', requireAuth, requireAdminOrSeller, async (req, res) => {
  const { sku, name, description, category, base_price, moq, stock_quantity, image_url } = req.body;

  // Sellers can only ever create products under their own storefront —
  // seller_id is never taken from the request body for them. Admins may
  // optionally pass seller_id to attach a listing to a specific storefront.
  let seller_id = null;
  if (req.user.role === 'seller') {
    if (!req.user.sellerId) {
      return res.status(403).json({ error: 'No storefront is associated with this account' });
    }
    seller_id = req.user.sellerId;
  } else if (req.body.seller_id) {
    seller_id = req.body.seller_id;
  }

  if (!sku || !name || base_price === undefined || base_price === null) {
    return res.status(400).json({ error: 'sku, name, and base_price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (seller_id, sku, name, description, category, base_price, moq, stock_quantity, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [seller_id, sku, name, description, category, base_price, moq || 1, stock_quantity || 0, image_url || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A product with that SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Edits an existing product's own fields (not its pricing tiers — see the
// dedicated route below for those). Sellers may only edit their own listings.
router.patch('/:id', requireAuth, requireAdminOrSeller, async (req, res) => {
  const product = await loadOwnedProduct(req, res);
  if (!product) return;

  const { name, description, category, base_price, moq, stock_quantity, image_url, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         base_price = COALESCE($4, base_price),
         moq = COALESCE($5, moq),
         stock_quantity = COALESCE($6, stock_quantity),
         image_url = COALESCE($7, image_url),
         active = COALESCE($8, active)
       WHERE id = $9 RETURNING *`,
      [name, description, category, base_price, moq, stock_quantity, image_url, active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.post('/:id/pricing-tiers', requireAuth, requireAdminOrSeller, async (req, res) => {
  const product = await loadOwnedProduct(req, res);
  if (!product) return;

  const { min_quantity, unit_price } = req.body;
  if (!min_quantity || unit_price === undefined || unit_price === null) {
    return res.status(400).json({ error: 'min_quantity and unit_price are required' });
  }
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

router.delete('/:id/pricing-tiers/:tierId', requireAuth, requireAdminOrSeller, async (req, res) => {
  const product = await loadOwnedProduct(req, res);
  if (!product) return;

  try {
    const result = await pool.query(
      'DELETE FROM pricing_tiers WHERE id = $1 AND product_id = $2 RETURNING id',
      [req.params.tierId, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing tier not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove pricing tier' });
  }
});

// Removes a product from the catalog. This is a soft delete (active = false)
// rather than a row delete: past orders still reference this product_id via
// order_items, and a hard DELETE would either fail on that foreign key or,
// worse, silently corrupt historical order records. Soft-deleted products
// are simply excluded from the public listing/detail queries above.
router.delete('/:id', requireAuth, requireAdminOrSeller, async (req, res) => {
  const product = await loadOwnedProduct(req, res);
  if (!product) return;

  try {
    const result = await pool.query(
      `UPDATE products SET active = false WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove product' });
  }
});

module.exports = router;
