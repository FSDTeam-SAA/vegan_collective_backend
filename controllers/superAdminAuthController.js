const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'thisisasecret';

exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const superAdmin = await User.findOne({ email, role: 'superadmin' });
    if (!superAdmin) {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // const token = jwt.sign({ id: superAdmin._id, role: superAdmin.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      // token,
      Admin: {
        id: superAdmin._id,
        email: superAdmin.email,
        fullName: superAdmin.fullName,
        role: superAdmin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
  }
};

exports.sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'superadmin' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.forgotPasswordOtp = otp;
    user.forgotPasswordOtpExpires = otpExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Super Admin Password',
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email, role: 'superadmin' });

    if (!user || user.forgotPasswordOtp !== otp || user.forgotPasswordOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotPasswordOtp = undefined;
    user.forgotPasswordOtpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset password', error: err.message });
  }
};
