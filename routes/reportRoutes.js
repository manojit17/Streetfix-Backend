// ─────────────────────────────────────────────────────────────
//  routes/reportRoutes.js
//  PURPOSE : Define the URL paths for report operations
//  ROUTES  :
//    POST /api/reports            → create a report (protected)
//    GET  /api/reports            → get all reports (public)
//    GET  /api/reports/my         → get my reports (protected)
//    PUT  /api/reports/:id/status → update status (protected)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

// Import controller functions
const {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
} = require('../controllers/reportController');

// Import middleware
const { protect } = require('../middleware/auth');   // JWT check
const upload      = require('../middleware/upload'); // image upload

// ── PUBLIC ROUTES ─────────────────────────────────────────────

// GET /api/reports — get all reports (anyone can see)
router.get('/', getAllReports);

// ── PROTECTED ROUTES (must be logged in) ─────────────────────

// POST /api/reports — create a new report
// protect        → checks JWT token first
// upload.single  → processes one image file named "image"
router.post('/', protect, upload.single('image'), createReport);

// GET /api/reports/my — get only the logged-in user's reports
// NOTE: this route must come BEFORE /:id routes to avoid conflicts
router.get('/my', protect, getMyReports);

// PUT /api/reports/:id/status — update the status of a specific report
// :id is a URL parameter (e.g. /api/reports/64abc123/status)
router.put('/:id/status', protect, updateReportStatus);

module.exports = router;
