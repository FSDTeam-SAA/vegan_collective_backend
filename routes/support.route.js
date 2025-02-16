const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller'); // Adjust the path as needed

// Create a new support ticket
router.post('/tickets', supportController.createSupportTicket);

// Get all support tickets
router.get('/tickets', supportController.getAllSupportTickets);

// Get support ticket by ID
router.get('/tickets/:id', supportController.getSupportTicketById);

// Update support ticket by ID
router.put('/tickets/:id', supportController.updateSupportTicket);

// Delete support ticket by ID
router.delete('/tickets/:id', supportController.deleteSupportTicket);

module.exports = router;