const express = require("express");
const { sendSms } = require("../controllers/smsController");
const router = express.Router();

router.post("/send", sendSms);

module.exports = router;