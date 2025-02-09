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
            return res.status(404).json({ 
                status: false,
                message: 'User not found'
            });
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
        res.status(200).json({ 
            status: true,
            message: 'OTP sent to your email'

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false,
            message: 'Server error'
        });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                status: false,
                message: 'User not found'
            });
        }
        // Check if OTP matches and hasn't expired
        if (user.forgotPasswordOtp !== otp || Date.now() > user.forgotPasswordOtpExpires) {
            return res.status(400).json({ 
                status: false,
                message: 'Invalid or expired OTP'
            });
        }
        res.status(200).json({ 
            status: true,
            message: 'OTP verified successfully' 
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false,
            message: 'Server error'
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                status: false,
                message: 'User not found'
            });
        }
        // Update the user's password
        user.password = newPassword;
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpires = undefined;
        await user.save();
        res.status(200).json({ 
            status: true,
            message: 'Password reset successfully'
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false,
            message: 'Server error' 
        });
    }
};