const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');

const router = express.Router();

// Register a new B2B account — either a 'buyer' (places wholesale orders)
// or a 'seller' (lists products of their own for other buyers to order).
// New accounts of both kinds start as 'pending' until an admin approves
// them; for buyers that also sets credit terms, for sellers it's what
// flips their storefront to "Verified".
router.post(
  '/register',
  [
    body('companyName').trim().notEmpty(),
    body('contactName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('accountType').optional().isIn(['buyer', 'seller']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, contactName, email, password, location } = req.body;
    const accountType = req.body.accountType === 'seller' ? 'seller' : 'buyer';

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'An account with that email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (company_name, contact_name, email, password_hash, role, payment_terms, credit_limit, status)
         VALUES ($1, $2, $3, $4, $5, 'net_30', 0, 'pending')
         RETURNING id, company_name, contact_name, email, role, status`,
        [companyName, contactName, email, passwordHash, accountType]
      );
      const user = userResult.rows[0];

      // Sellers get a storefront row right away (unverified, hidden from
      // the "sold by" filter's normal trust signals until an admin approves
      // the account) so they have somewhere to attach products immediately.
      if (accountType === 'seller') {
        await client.query(
          `INSERT INTO sellers (owner_user_id, name, location, verified)
           VALUES ($1, $2, $3, false)`,
          [user.id, companyName, location || null]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message:
          accountType === 'seller'
            ? 'Seller account created. It is pending admin approval before your products go live.'
            : 'Account created. It is pending admin approval before you can place orders.',
        user,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    } finally {
      client.release();
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.status !== 'approved') {
        return res.status(403).json({ error: `Account is ${user.status}. Contact us for approval.` });
      }

      // Sellers act on their own storefront row, so resolve it once at
      // login and bake it into the token — every product route can then
      // trust req.user.sellerId instead of re-deriving it per request.
      let sellerId = null;
      if (user.role === 'seller') {
        const sellerRes = await pool.query('SELECT id FROM sellers WHERE owner_user_id = $1', [user.id]);
        sellerId = sellerRes.rows[0]?.id || null;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          companyName: user.company_name,
          sellerId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          companyName: user.company_name,
          contactName: user.contact_name,
          email: user.email,
          role: user.role,
          paymentTerms: user.payment_terms,
          creditLimit: user.credit_limit,
          creditUsed: user.credit_used,
          sellerId,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

module.exports = router;
