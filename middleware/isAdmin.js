// ─────────────────────────────────────────────────────────────
//  middleware/isAdmin.js
//  PURPOSE : Blocks access to admin-only routes unless the
//            logged-in user has role: 'admin'
// ─────────────────────────────────────────────────────────────

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = isAdmin;