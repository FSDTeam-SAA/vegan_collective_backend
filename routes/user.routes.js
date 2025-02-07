const express = require("express");
const {
  userSignup,
  verifyEmail,
  loginUser,
  logoutUser,
} = require('../controllers/user.controller')
const router = express.Router();
 
router.post("/signup", userSignup);
router.get('/verify-email/', verifyEmail)
router.post('/login', loginUser)
router.get("/logout", logoutUser)

module.exports = router;