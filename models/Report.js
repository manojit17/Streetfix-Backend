// ─────────────────────────────────────────────────────────────
//  models/Report.js
//  PURPOSE : Define the shape of a Report document in MongoDB
//  FIELDS  : title, description, image, supporters, severity,
//            latitude, longitude, status, verifications,
//            resolvedBy, resolvedAt, userId, createdAt
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type     : String,
      required : [true, 'Please provide a title'],
      trim     : true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },

    description: {
      type     : String,
      required : [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },

    image: {
      type   : String,
      default: null,
    },

    supporters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
      },
    ],

    severity: {
      type    : String,
      enum    : ['Low', 'Medium', 'High', 'Critical'],
      default : 'Medium',
    },

    latitude: {
      type    : Number,
      required: [true, 'Please provide latitude'],
    },

    longitude: {
      type    : Number,
      required: [true, 'Please provide longitude'],
    },

    status: {
      type    : String,
      enum    : ['Pending', 'Verified', 'In Progress', 'Resolved'],
      default : 'Pending',
    },

    verifications: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref : 'User',
        },
        type: {
          type    : String,
          enum    : ['confirm', 'resolved'],
          required: true,
        },
        photo: {
          type   : String,
          default: null,
        },
        distance: Number,
        createdAt: {
          type   : Date,
          default: Date.now,
        },
      },
    ],

    resolvedBy: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : 'User',
      default: null,
    },

    resolvedAt: {
      type   : Date,
      default: null,
    },

    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', ReportSchema);