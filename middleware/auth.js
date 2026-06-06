// ─────────────────────────────────────────────────────────────
//  middleware/auth.js
//  PURPOSE : Protect routes — only logged-in users can access them
//  HOW     : Reads the JWT from the Authorization header,
//            verifies it, and attaches the user to req.user
// ─────────────────────────────────────────────────────────────

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the header like:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Split "Bearer <token>" and grab the token part
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token was found, block the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // Verify the token using the same secret used to sign it
    // decoded will contain { id: "userId", iat: ..., exp: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in DB using the ID inside the token
    // .select('-password') means "give me everything EXCEPT the password"
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    next(); // token is valid → let the request continue
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — token is invalid or expired',
    });
  }
};

module.exports = { protect };
