const Verification = require('../models/Verification')
const Report       = require('../models/Report')

// Haversine — distance in meters
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R     = 6371000
  const toRad = d => d * (Math.PI / 180)
  const dLat  = toRad(lat2 - lat1)
  const dLng  = toRad(lng2 - lng1)
  const a     = Math.sin(dLat/2)**2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// POST /api/reports/:id/verify
const verifyReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) { res.statusCode = 404; throw new Error('Report not found') }

    // Can't verify your own report
    if (report.userId.toString() === req.user._id.toString()) {
      res.statusCode = 400; throw new Error('You cannot verify your own report')
    }

    // Check distance — must be within 500m
    const { type, latitude, longitude } = req.body
    if (!latitude || !longitude) {
      res.statusCode = 400; throw new Error('Location is required to verify')
    }

    const distance = getDistanceInMeters(
      parseFloat(latitude), parseFloat(longitude),
      report.latitude, report.longitude
    )

    if (distance > 500) {
      res.statusCode = 400
      throw new Error(`You must be within 500m of the issue to verify. You are ${Math.round(distance)}m away.`)
    }

    // Check for duplicate verification
    const existing = await Verification.findOne({
      reportId: report._id,
      userId  : req.user._id,
    })
    if (existing) {
      res.statusCode = 400; throw new Error('You have already verified this report')
    }

    // Save photo to Cloudinary if uploaded
    const photo = req.file ? req.file.path : null

    // Create verification
    await Verification.create({
      reportId : report._id,
      userId   : req.user._id,
      type,
      photo,
      latitude : parseFloat(latitude),
      longitude: parseFloat(longitude),
    })
const Notification = require('../models/Notification')

// Inside verifyReport, after Verification.create():
await Notification.create({
  userId     : report.userId,
  type       : 'verification',
  message    : type === 'confirm'
    ? `${req.user.name} confirmed your report "${report.title}" is still an issue`
    : `${req.user.name} says your report "${report.title}" has been fixed! 🎉`,
  reportId   : report._id,
  triggeredBy: req.user._id,
})

    // If enough people say it's resolved, auto-update report status
    if (type === 'resolved') {
      const resolvedCount = await Verification.countDocuments({
        reportId: report._id,
        type    : 'resolved',
      })
      if (resolvedCount >= 3) {
        report.status = 'Resolved'
        await report.save()
      }
    }

    // Return updated report with fresh verification data
    const verifications = await Verification.find({ reportId: report._id })
      .populate('userId', 'name')

    const updatedReport = await Report.findById(report._id)
      .populate('userId', 'name')

    res.status(201).json({
      success      : true,
      message      : type === 'confirm'
        ? 'Thanks for confirming this issue exists!'
        : 'Thanks for reporting this as fixed!',
      data         : { ...updatedReport.toObject(), verifications },
    })
  } catch (error) { next(error) }
}

// GET /api/verifications/my — my verifications for Profile page
const getMyVerifications = async (req, res, next) => {
  try {
    const verifications = await Verification.find({ userId: req.user._id })
      .populate('reportId', 'title description status image latitude longitude')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: verifications })
  } catch (error) { next(error) }
}

module.exports = { verifyReport, getMyVerifications }