const Notification = require('../models/Notification')

// GET /api/notifications — get my notifications (newest first)
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('triggeredBy', 'name')
      .populate('reportId',    'title')
      .sort({ createdAt: -1 })
      .limit(20) // only last 20

    res.status(200).json({ success: true, data: notifications })
  } catch (error) { next(error) }
}

// PUT /api/notifications/read-all — mark all as read
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    )
    res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (error) { next(error) }
}

// PUT /api/notifications/:id/read — mark one as read
const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    )
    res.status(200).json({ success: true })
  } catch (error) { next(error) }
}

module.exports = { getMyNotifications, markAllRead, markOneRead }