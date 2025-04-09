const express = require("express");
const router = express.Router();
const {
  superAdminLogin,sendResetPasswordLink,resetPassword,
} = require("../controllers/superAdminAuthController");

// POST /api/superadmin/login
router.post("/Superadminlogin", superAdminLogin);

// POST /api/superadmin/send-reset-link
router.post("/send-reset-link", sendResetPasswordLink);

// POST /api/superadmin/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
