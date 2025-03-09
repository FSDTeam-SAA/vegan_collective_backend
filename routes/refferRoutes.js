const express = require("express");
const { findOrCreateReffer,getRefferByCreator } = require("../controllers/refferController");

const router = express.Router();

// Define a POST route for finding or creating a referral
router.post("/reffer", findOrCreateReffer);

// New route to get referral by creator ID
router.get("/reffer/:creatorId", getRefferByCreator);

module.exports = router;
