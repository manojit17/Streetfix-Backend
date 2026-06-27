// ─────────────────────────────────────────────────────────────
//  server.js
//  PURPOSE : Entry point of the entire backend application
// ─────────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB        = require('./config/db');
const authRoutes       = require('./routes/authRoutes');
const reportRoutes     = require('./routes/reportRoutes');
const { errorHandler } = require('./middleware/error');

// ── CONNECT TO DATABASE ───────────────────────────────────────
connectDB();

// ── CREATE EXPRESS APP ────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────
// ✅ FIX: origin:'*' does NOT work when Authorization header is sent
// You MUST list the exact frontend URL instead
const corsOptions = {
  origin: [
    'https://street-fix-six.vercel.app',   // ✅ your Vercel frontend
    'http://localhost:5173',                // local dev (Vite)
    'http://localhost:3000',                // local dev fallback
  ],
  methods      : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials  : true,   // ✅ required when sending Authorization header
}

app.use(cors(corsOptions))

// ✅ Handle preflight OPTIONS requests for ALL routes
// Browsers send this automatically before POST/PUT/DELETE with headers
app.options('*', cors(corsOptions))

// ── BODY PARSERS ──────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── STATIC FILES ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success    : true,
    message    : 'StreetFix API is running! 🚀',
    environment: process.env.NODE_ENV,
    timestamp  : new Date().toISOString(),
  })
})

// ── API ROUTES ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes)
app.use('/api/reports', reportRoutes)

// ── ROOT ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: '🛣️ StreetFix API is running', version: '1.0.0' })
})

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// ── ERROR HANDLER ─────────────────────────────────────────────
app.use(errorHandler)

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 StreetFix server running on http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
})