// ─────────────────────────────────────────────────────────────
//  routes/authRoutes.js
//  PURPOSE : Define the URL paths for authentication
//  ROUTES  :
//    POST /api/auth/register  → create new account
//    POST /api/auth/login     → login and get JWT token
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

// Import the controller functions
const { register, login } = require('../controllers/authController');

// POST /api/auth/register
// No middleware needed — this is a public route
router.post('/register', register);

// POST /api/auth/login
// No middleware needed — this is a public route
router.post('/login', login);

module.exports = router;
