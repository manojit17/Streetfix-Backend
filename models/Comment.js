const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    reportId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'Report',
      required: true,
    },
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
    text: {
      type     : String,
      required : [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim     : true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Comment', CommentSchema)