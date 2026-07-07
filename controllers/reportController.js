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

    // CHANGED: with CloudinaryStorage, req.file.path now contains the
    // FULL permanent Cloudinary URL (e.g. "https://res.cloudinary.com/...")
    // instead of just a local filename like "1712345-photo.jpg".
    // We store this full URL directly — no more building a URL later.
    const image = req.file ? req.file.path : null;

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
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;

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

    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      res.statusCode = 400;
      throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      res.statusCode = 404;
      throw new Error('Report not found');
    }

    if (report.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized — you can only update your own reports');
    }

    report.status = status;
    await report.save();
const Notification = require('../models/Notification')

// Inside toggleSupport, after report.save():
if (!alreadySupported) {
  // Only notify when ADDING support, not removing it
  // Don't notify if you support your own report
  if (report.userId.toString() !== req.user._id.toString()) {
    await Notification.create({
      userId     : report.userId,
      type       : 'support',
      message    : `${req.user.name} supported your report "${report.title}"`,
      reportId   : report._id,
      triggeredBy: req.user._id,
    })
  }
}

    res.status(200).json({
      success: true,
      message: `Report status updated to "${status}"`,
      data   : report,
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE REPORT ─────────────────────────────
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) { res.statusCode = 404; throw new Error('Report not found') }
    if (report.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403; throw new Error('Not authorized')
    }
    const { title, description, severity } = req.body
    if (title)       report.title       = title
    if (description) report.description = description
    if (severity)    report.severity    = severity
    if (req.file)    report.image       = req.file.path
    await report.save()
    await Notification.create({
  userId     : report.userId,
  type       : 'status_change',
  message    : `Your report "${report.title}" status changed to "${status}"`,
  reportId   : report._id,
  triggeredBy: req.user._id,
})
    res.status(200).json({ success:true, message:'Report updated', data:report })
  } catch (error) { next(error) }
}

// ── DELETE REPORT ─────────────────────────────
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) { res.statusCode = 404; throw new Error('Report not found') }
    if (report.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403; throw new Error('Not authorized')
    }
    await report.deleteOne()
    res.status(200).json({ success:true, message:'Report deleted' })
  } catch (error) { next(error) }
}
// ── TOGGLE SUPPORT (UPVOTE) ─────────────────
const toggleSupport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) { res.statusCode = 404; throw new Error('Report not found') }

    const userId = req.user._id.toString()
    const alreadySupported = report.supporters.some(
      id => id.toString() === userId
    )

    if (alreadySupported) {
      // Remove support — filter out the current user's ID
      report.supporters = report.supporters.filter(
        id => id.toString() !== userId
      )
    } else {
      // Add support
      report.supporters.push(req.user._id)
    }

    await report.save()

    res.status(200).json({
      success: true,
      message: alreadySupported ? 'Support removed' : 'Support added',
      supportersCount: report.supporters.length,
      isSupportedByMe: !alreadySupported,
    })
  } catch (error) { next(error) }
}
// ── DISTANCE HELPER (Haversine, meters) ──────────────────────
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R     = 6371000
  const toRad = (d) => d * (Math.PI / 180)
  const dLat  = toRad(lat2 - lat1)
  const dLng  = toRad(lng2 - lng1)
  const a     = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── VERIFY REPORT ─────────────────────────────────────────────
// POST /api/reports/:id/verify
// Protected — user must be within 500m, can't verify own report,
// can only verify once. Photo optional.
// Body: { type: 'confirm' | 'resolved', latitude, longitude }
// File: photo (optional, multipart/form-data)
const verifyReport = async (req, res, next) => {
  try {
    const { type, latitude, longitude } = req.body

    const allowedTypes = ['confirm', 'resolved']
    if (!allowedTypes.includes(type)) {
      res.statusCode = 400
      throw new Error(`Type must be one of: ${allowedTypes.join(', ')}`)
    }

    if (!latitude || !longitude) {
      res.statusCode = 400
      throw new Error('Please provide your current latitude and longitude')
    }

    const report = await Report.findById(req.params.id)
    if (!report) { res.statusCode = 404; throw new Error('Report not found') }

    // Can't verify your own report
    if (report.userId.toString() === req.user._id.toString()) {
      res.statusCode = 403
      throw new Error('You cannot verify your own report')
    }

    // Must be within 500m
    const distance = getDistanceInMeters(
      parseFloat(latitude), parseFloat(longitude),
      report.latitude, report.longitude
    )
    if (distance > 500) {
      res.statusCode = 403
      throw new Error(`You must be within 500m to verify (you're ${Math.round(distance)}m away)`)
    }

    // Can only verify once
    const userId = req.user._id.toString()
    const alreadyVerified = report.verifications.some(v => v.userId.toString() === userId)
    if (alreadyVerified) {
      res.statusCode = 400
      throw new Error('You have already verified this report')
    }

    const photo = req.file ? req.file.path : null

    report.verifications.push({
      userId  : req.user._id,
      type,
      photo,
      distance: Math.round(distance),
    })

    // Recalculate status from verification counts
    const confirmCount  = report.verifications.filter(v => v.type === 'confirm').length
    const resolvedCount = report.verifications.filter(v => v.type === 'resolved').length

    if (resolvedCount >= 2) {
      report.status = 'Resolved'
    } else if (confirmCount >= 3 && report.status === 'Pending') {
      report.status = 'Verified'
    }

    await report.save()

    res.status(200).json({
      success: true,
      message: type === 'confirm' ? 'Report verified' : 'Marked as resolved',
      data   : report,
    })
  } catch (error) { next(error) }
}
module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
  updateReport,
  deleteReport,
  toggleSupport,
  verifyReport,
};