const express = require('express')
const router  = express.Router()
const { getMyVerifications } = require('../controllers/verificationController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/my', protect, getMyVerifications)

module.exports = router