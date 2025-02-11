const express = require("express");
const router = express.Router();
const FAQController = require("../controllers/professionalFAQ.controller");

// Create a new FAQ
router.post("/faq", FAQController.createFAQ);

// Get all FAQs
router.get("/faq", FAQController.getAllFAQs);

// Get a single FAQ by ID
router.get("/faq/:id", FAQController.getFAQById);

// Update an FAQ by ID
router.put("/faq/:id", FAQController.updateFAQ);

// Delete an FAQ by ID
router.delete("/faq/:id", FAQController.deleteFAQ);

module.exports = router;