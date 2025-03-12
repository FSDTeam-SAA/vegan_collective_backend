const express = require("express");
const router = express.Router();
const professionalFAQController = require("../controllers/professionalFAQ.controller"); // Adjust the path as needed

// Create a new FAQ
router.post("/faqs", professionalFAQController.createFAQ);

// Get all FAQs (no userID required)
router.get("/faqs", professionalFAQController.getAllFAQs);

// Get a specific FAQ by ID
router.get("/faqs/:userID", professionalFAQController.getFAQsByUserID);

// Update an FAQ by ID
router.put("/faqs/:userID", professionalFAQController.updateFAQsByUserID);

// Delete an FAQ by ID
router.delete("/faqs/:userID", professionalFAQController.deleteFAQsByUserID);

module.exports = router;