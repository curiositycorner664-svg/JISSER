const jwt = require('jsonwebtoken');

// Verifies the JWT sent in the Authorization header and attaches the
// decoded user payload to req.user. Blocks the request if missing/invalid.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, companyName }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restricts a route to admin accounts only. Use after requireAuth.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Restricts a route to sellers managing their own storefront, or admins
// managing anything. Use after requireAuth. Route handlers that allow both
// still need to scope sellers to their own seller_id — this only checks role.
function requireAdminOrSeller(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'seller')) {
    return res.status(403).json({ error: 'Seller or admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireAdminOrSeller };
