const express = require("express");
const { userSignup, verifyEmail } = require('../controllers/user.controller')
const router = express.Router();
 
router.post("/signup", userSignup);
router.get('/verify-email/', verifyEmail)

module.exports = router;