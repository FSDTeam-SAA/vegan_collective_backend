const express = require('express');
const router = express.Router();
const professionalFAQController = require('../controllers/professionalFAQ.controller');

// Create a new FAQ
router.post('/create', professionalFAQController.createFAQ);

// Get all FAQs
router.get('/all', professionalFAQController.getAllFAQs);

// Get FAQ by ID
router.get('/faq/:id', professionalFAQController.getFAQById);

// Update FAQ by ID
router.put('/faq/:id', professionalFAQController.updateFAQ);

// Delete FAQ by ID
router.delete('/faq/:id', professionalFAQController.deleteFAQ);

module.exports = router;