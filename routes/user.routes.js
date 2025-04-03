const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.Controller");
const upload = require("../utils/multerConfig");

// Register a new user
router.post("/register", userController.registerUser);

// Verify email
router.get("/verify-email", userController.verifyEmail);
// Login a user
router.post("/login", userController.loginUser);

// Logout a user
router.post("/logout", userController.logoutUser);

// Forgot Password -  Send OTP to email
router.post("/forgot-password", authController.forgotPasswordSendOTP);

// Forgot Password -  Verify OTP
router.post("/verify-otp", authController.verifyForgotPasswordOTP);

// Forgot Password -  Change Password
router.post("/change-password", authController.changePassword);

// Get user profile
router.get("/profile/:userId", userController.getUserProfile);

// Update user profile
router.put('/users/:userId/update-isgratings', userController.updateIsgratings);


// Update user profile
router.put(
    "/profile/:userId",
    upload.single("profilePhoto"), // Middleware for handling single file upload
    userController.updateUserProfile
  );


module.exports = router;