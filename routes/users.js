const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Logged-in buyer's own profile + credit summary.
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT id, company_name, contact_name, email, role, payment_terms, credit_limit, credit_used, status
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json(result.rows[0]);
});

// --- Admin: manage B2B accounts ---

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, company_name, contact_name, email, role, payment_terms, credit_limit, credit_used, status, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

// Approve a pending account and set its credit terms.
router.patch('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const { credit_limit, payment_terms } = req.body;
  const result = await pool.query(
    `UPDATE users SET status = 'approved', credit_limit = COALESCE($1, credit_limit),
     payment_terms = COALESCE($2, payment_terms) WHERE id = $3 RETURNING id, company_name, status, credit_limit, payment_terms`,
    [credit_limit, payment_terms, req.params.id]
  );
  res.json(result.rows[0]);
});

router.patch('/:id/suspend', requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING id, company_name, status`,
    [req.params.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;
