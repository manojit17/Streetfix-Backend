const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
    // What type of notification
    type: {
      type: String,
      enum: ['support', 'comment', 'verification', 'status_change'],
      required: true,
    },
    // Human readable message
    message: {
      type    : String,
      required: true,
    },
    // Which report this is about
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Report',
      default: null,
    },
    // Who triggered it (the person who liked/commented/verified)
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      default: null,
    },
    // Has the recipient read it yet
    read: {
      type   : Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Index for fast lookup of a user's notifications
NotificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', NotificationSchema)