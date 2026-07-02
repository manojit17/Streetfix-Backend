// ─────────────────────────────────────────────────────────────
//  server.js
//  PURPOSE : Entry point of the entire backend application
// ─────────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const connectDB              = require('./config/db');
const authRoutes             = require('./routes/authRoutes');
const reportRoutes           = require('./routes/reportRoutes');
const commentRoutes          = require('./routes/commentRoutes');
const verificationRoutes     = require('./routes/verificationRoutes');
const { errorHandler }       = require('./middleware/error');

// ── ENSURE UPLOADS FOLDER EXISTS ─────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// ── CONNECT TO DATABASE ───────────────────────────────────────
connectDB();

// ── CREATE EXPRESS APP ────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    'https://street-fix-six.vercel.app',
    'https://street-fix-manojit-raul-s-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods      : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials  : true,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ── BODY PARSERS ──────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── STATIC FILES ──────────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir))

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
app.use('/api/auth',          authRoutes)
app.use('/api/reports',       reportRoutes)
app.use('/api/comments',      commentRoutes)
app.use('/api/verifications', verificationRoutes)   // ← Phase 3 added

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