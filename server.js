// ─────────────────────────────────────────────────────────────
//  server.js
//  PURPOSE : Entry point of the entire backend application
//  DOES    :
//    1. Loads environment variables from .env
//    2. Connects to MongoDB
//    3. Sets up Express with all middleware
//    4. Registers all API routes
//    5. Starts listening on the configured port
// ─────────────────────────────────────────────────────────────

// Load .env variables FIRST — before anything else
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const open = (...args) =>
  import("open").then((module) => module.default(...args));

// Import our custom modules
const connectDB      = require('./config/db');
const authRoutes     = require('./routes/authRoutes');
const reportRoutes   = require('./routes/reportRoutes');
const { errorHandler } = require('./middleware/error');

// ── CONNECT TO DATABASE ───────────────────────────────────────
connectDB();

// ── CREATE EXPRESS APP ────────────────────────────────────────
const app = express();

// ── GLOBAL MIDDLEWARE ─────────────────────────────────────────

// CORS — allows the React frontend (on a different port) to talk to this API
app.use(cors({
  origin     : '*',             // In production, replace * with your frontend URL
  methods    : ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies (e.g. { name, email, password })
app.use(express.json());

// Parse URL-encoded form data (e.g. from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve the /uploads folder as static files
// This lets the frontend load images at: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API ROUTES ────────────────────────────────────────────────

// All auth routes:    /api/auth/register  and  /api/auth/login
app.use('/api/auth', authRoutes);

// All report routes:  /api/reports  and  /api/reports/my  etc.
app.use('/api/reports', reportRoutes);

// ── HEALTH CHECK ROUTE ────────────────────────────────────────
// Quick check to confirm the server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛣️ StreetFix API is running',
    version: '1.0.0',
  });
});

// ── 404 HANDLER ───────────────────────────────────────────────
// Catches any request to a route that doesn't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── ERROR HANDLER ─────────────────────────────────────────────
// Must be LAST — catches errors thrown by any route or middleware
app.use(errorHandler);

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`StreetFix server running on http://localhost:${PORT}`);

  await open(`http://localhost:${PORT}`);
});
