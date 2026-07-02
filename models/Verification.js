const mongoose = require('mongoose')

const VerificationSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report', required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    type: {
      type: String,
      enum: ['confirm', 'resolved'],
      required: true,
    },
    photo    : { type: String, default: null },
    latitude : { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
)

// Prevent same user verifying the same report twice
VerificationSchema.index({ reportId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Verification', VerificationSchema)