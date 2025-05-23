const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route xác thực email
router.get('/verify-email', authController.verifyEmail);

module.exports = router; 