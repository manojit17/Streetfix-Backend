const express = require('express')
const router  = express.Router()
const { getComments, addComment, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/auth')

router.get('/:reportId',    getComments)               // public — anyone can read
router.post('/:reportId',   protect, addComment)        // protected — must be logged in
router.delete('/:id',       protect, deleteComment)     // protected — own comment only

module.exports = router