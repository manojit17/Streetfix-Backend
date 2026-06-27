// ─────────────────────────────────────────────────────────────
//  routes/reportRoutes.js
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

// ✅ ONE single require — includes ALL 6 functions
const {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
  updateReport,
  deleteReport,
} = require('../controllers/reportController');

const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');

// ── PUBLIC ────────────────────────────────────────────────────
router.get('/', getAllReports);

// ── PROTECTED ─────────────────────────────────────────────────
router.post('/',          protect, upload.single('image'), createReport);
router.get('/my',         protect, getMyReports);
router.put('/:id/status', protect, updateReportStatus);
router.put('/:id',        protect, upload.single('image'), updateReport);
router.delete('/:id',     protect, deleteReport);

module.exports = router;