const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller'); // Adjust the path as needed

// Create a new support ticket
router.post('/professionalsupport', supportController.createSupportTicket);

// Get all support tickets
router.get('/professionalsupport', supportController.getAllSupportTickets);

// Get support ticket by ID
router.get('/professionalsupport/:id', supportController.getSupportTicketById);

// Update support ticket by ID
router.put('/professionalsupport/:id', supportController.updateSupportTicket);

// Delete support ticket by ID
router.delete('/professionalsupport/:id', supportController.deleteSupportTicket);

module.exports = router;