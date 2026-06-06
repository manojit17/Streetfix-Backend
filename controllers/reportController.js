// ─────────────────────────────────────────────────────────────
//  controllers/reportController.js
//  PURPOSE : Handle all report-related operations
//  EXPORTS : createReport, getAllReports, getMyReports,
//            updateReportStatus
// ─────────────────────────────────────────────────────────────

const Report = require('../models/Report');

// ── CREATE REPORT ─────────────────────────────────────────────
// POST /api/reports
// Protected — user must be logged in
// Body: { title, description, severity, latitude, longitude }
// File: image (optional, multipart/form-data)
const createReport = async (req, res, next) => {
  try {
    const { title, description, severity, latitude, longitude } = req.body;

    // Validate required fields
    if (!title || !description || !latitude || !longitude) {
      res.statusCode = 400;
      throw new Error('Please provide title, description, latitude, and longitude');
    }

    // If an image was uploaded, req.file will contain it
    // We store only the filename, not the full path
    const image = req.file ? req.file.filename : null;

    // Create the report in MongoDB
    // req.user._id comes from the auth middleware (protect)
    const report = await Report.create({
      title,
      description,
      image,
      severity : severity || 'Medium',
      latitude : parseFloat(latitude),   // ensure it's a number
      longitude: parseFloat(longitude),
      userId   : req.user._id,           // attach the logged-in user's ID
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data   : report,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL REPORTS ───────────────────────────────────────────
// GET /api/reports
// Public — anyone can view all reports
// Supports optional query filters: ?status=Pending&severity=High
const getAllReports = async (req, res, next) => {
  try {
    // Build a filter object from query params
    // e.g. GET /api/reports?status=Pending  →  filter = { status: 'Pending' }
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;

    // Find reports, newest first (-1 = descending order)
    // .populate('userId', 'name email') replaces userId with actual user data
    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count  : reports.length,
      data   : reports,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET MY REPORTS ────────────────────────────────────────────
// GET /api/reports/my
// Protected — returns only the logged-in user's reports
const getMyReports = async (req, res, next) => {
  try {
    // Filter by the logged-in user's ID
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count  : reports.length,
      data   : reports,
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE REPORT STATUS ──────────────────────────────────────
// PUT /api/reports/:id/status
// Protected — only the report owner can update status
// Body: { status }  — must be "Pending", "In Progress", or "Resolved"
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate the new status value
    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      res.statusCode = 400;
      throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
    }

    // Find the report by its ID from the URL param (:id)
    const report = await Report.findById(req.params.id);

    if (!report) {
      res.statusCode = 404;
      throw new Error('Report not found');
    }

    // Make sure the logged-in user owns this report
    // .toString() converts ObjectId to string for comparison
    if (report.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized — you can only update your own reports');
    }

    // Update the status and save
    report.status = status;
    await report.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to "${status}"`,
      data   : report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
};
