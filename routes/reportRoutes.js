// ─────────────────────────────────────────────────────────────
//  routes/authRoutes.js
//  PURPOSE : Define the URL paths for authentication
//  ROUTES  :
//    POST /api/auth/register       → create new account
//    POST /api/auth/login          → login and get JWT token
//    PUT  /api/auth/profile        → update profile (protected)
//    PUT  /api/auth/password       → change password (protected)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

// Import the controller functions
const { register, login, updateProfile, changePassword } = require('../controllers/authController');

// Import the protect middleware
const { protect } = require('../middleware/auth'); // ✅ correct path

// POST /api/auth/register — public route
router.post('/register', register);

// POST /api/auth/login — public route
router.post('/login', login);

// PUT /api/auth/profile — protected route
router.put('/profile', protect, updateProfile);

// PUT /api/auth/password — protected route
router.put('/password', protect, changePassword);

module.exports = router;