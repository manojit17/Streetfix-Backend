// ─────────────────────────────────────────────────────────────
//  controllers/authController.js
//  PURPOSE : Handle user registration and login
//  EXPORTS : register, login
// ─────────────────────────────────────────────────────────────

const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// ── HELPER: Generate JWT Token ────────────────────────────────
// Takes a user ID and returns a signed JWT string
// This token is what the frontend stores and sends back on every request
const generateToken = (id) => {
  return jwt.sign(
    { id },                      // payload — data stored inside the token
    process.env.JWT_SECRET,      // secret key used to sign the token
    { expiresIn: process.env.JWT_EXPIRE } // token expires after e.g. "7d"
  );
};

// ── REGISTER ──────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation — make sure all fields are provided
    if (!name || !email || !password) {
      res.statusCode = 400;
      throw new Error('Please provide name, email, and password');
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.statusCode = 400;
      throw new Error('Email already registered — please login instead');
    }

    // Create the user (password gets hashed by the pre-save hook in User.js)
    const user = await User.create({ name, email, password });

    // Generate a JWT for this user
    const token = generateToken(user._id);

    // Send back the token and basic user info
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id   : user._id,
        name : user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error); // pass to error handler middleware
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Make sure both fields are provided
    if (!email || !password) {
      res.statusCode = 400;
      throw new Error('Please provide email and password');
    }

    // Find the user by email
    // .select('+password') overrides the "select: false" in the model
    // so we can get the password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.statusCode = 401;
      throw new Error('Invalid credentials — email not found');
    }

    // Compare entered password with the hashed password in DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.statusCode = 401;
      throw new Error('Invalid credentials — wrong password');
    }

    // Credentials are correct — generate a token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id   : user._id,
        name : user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
