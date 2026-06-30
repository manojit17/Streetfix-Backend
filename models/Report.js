// ─────────────────────────────────────────────────────────────
//  models/Report.js
//  PURPOSE : Define the shape of a Report document in MongoDB
//  FIELDS  : title, description, image, severity,
//            latitude, longitude, status, userId, createdAt
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

    // Stores the filename of the uploaded image (e.g. "1712345678-photo.jpg")
    image: {
      type   : String,
      default: null, // image is optional
    },
    
    supporters: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
],

    severity: {
      type    : String,
      enum    : ['Low', 'Medium', 'High', 'Critical'], // only these 4 values allowed
      default : 'Medium',
    },

    // GPS coordinates — used to show the issue on a map
    latitude: {
      type    : Number,
      required: [true, 'Please provide latitude'],
    },

    longitude: {
      type    : Number,
      required: [true, 'Please provide longitude'],
    },

    // Tracks where the issue is in the fixing process
    status: {
      type    : String,
      enum    : ['Pending', 'In Progress', 'Resolved'],
      default : 'Pending',
    },

    // References which User created this report
    // mongoose.Schema.Types.ObjectId is the type MongoDB uses for IDs
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',          // tells Mongoose this links to the User model
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Report', ReportSchema);
