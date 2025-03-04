const express = require("express");
const { findOrCreateReffer } = require("../controllers/refferController");

const router = express.Router();

// Define a POST route for finding or creating a referral
router.post("/reffer", findOrCreateReffer);

module.exports = router;
