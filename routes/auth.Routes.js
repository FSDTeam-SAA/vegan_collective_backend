const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.Controller');

// Forgot Password Route
router.post('/forgot-password', authController.forgotPassword);

// Verify OTP Route
router.post('/verify-otp', authController.verifyOtp);

// Reset Password Route
router.post('/reset-password', authController.resetPassword);

module.exports = router;