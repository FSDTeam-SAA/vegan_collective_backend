const express = require("express");
const { findOrCreateReffer,getRefferByCreator,getTopProfessionals} = require("../controllers/refferController");

const router = express.Router();

// Define a POST route for finding or creating a referral
router.post("/reffer", findOrCreateReffer);

// New route to get referral by creator ID
router.get("/reffer/:creatorId", getRefferByCreator);

// New route to get top professionals based on totalReferrals
router.get("/topprofessionalsbyreffer", getTopProfessionals);

module.exports = router;
