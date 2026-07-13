const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { asyncHandler } = require('../utils/asyncHandler')

router.post('/login', asyncHandler(authController.login))
router.get('/me', verifyToken, asyncHandler(authController.me))

module.exports = router
