const express = require("express");
const userProfile = require("../controllers/userProfile.controller");
const router = express.Router();

router.put("/user/profile/:id", userProfile);

module.exports = router;
