const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Register a new user
router.post("/register", userController.registerUser);

// Verify email
router.get("/verify-email", userController.verifyEmail);

module.exports = router;