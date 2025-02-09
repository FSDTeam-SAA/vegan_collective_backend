const User = require('../models/user.model');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Generate OTP and send it via email
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        // Save OTP and expiration time to the user document
        user.forgotPasswordOtp = otp;
        user.forgotPasswordOtpExpires = otpExpires;
        await user.save();
        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email', status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: false });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }
        // Check if OTP matches and hasn't expired
        if (user.forgotPasswordOtp !== otp || Date.now() > user.forgotPasswordOtpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP', status: false });
        }
        res.status(200).json({ message: 'OTP verified successfully', status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: false });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }
        // Update the user's password
        user.password = newPassword;
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully', status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', status: false });
    }
};