const Comment = require('../models/Comment')
const Report  = require('../models/Report')

// GET /api/comments/:reportId — get all comments for a report
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ reportId: req.params.reportId })
      .populate('userId', 'name')
      .sort({ createdAt: 1 }) // oldest first, like a chat
    res.status(200).json({ success: true, data: comments })
  } catch (error) { next(error) }
}

// POST /api/comments/:reportId — add a comment (protected)
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text || text.trim().length === 0) {
      res.statusCode = 400
      throw new Error('Comment text is required')
    }

    // Make sure the report actually exists
    const report = await Report.findById(req.params.reportId)
    if (!report) {
      res.statusCode = 404
      throw new Error('Report not found')
    }

    const comment = await Comment.create({
      reportId: req.params.reportId,
      userId  : req.user._id,
      text    : text.trim(),
    })

    // Return with user name populated so frontend can display it immediately
    const populated = await comment.populate('userId', 'name')

    res.status(201).json({ success: true, data: populated })
  } catch (error) { next(error) }
}

// DELETE /api/comments/:id — delete your own comment (protected)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      res.statusCode = 404
      throw new Error('Comment not found')
    }
    if (comment.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403
      throw new Error('Not authorized to delete this comment')
    }
    await comment.deleteOne()
    res.status(200).json({ success: true, message: 'Comment deleted' })
  } catch (error) { next(error) }
}

module.exports = { getComments, addComment, deleteComment }