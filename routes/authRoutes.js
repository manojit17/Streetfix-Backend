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
router.post('/register', registerController); //  This makes the URL: /api/auth/register
router.post('/login', loginController);       //  This makes the URL: /api/auth/login
module.exports = router;
