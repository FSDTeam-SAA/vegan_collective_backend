const express = require('express');
const router = express.Router();
const professionalHelpAndSupportController = require('../controllers/professionalHelpAndSupport.controller');

// Create a new support ticket
router.post('/tickets', professionalHelpAndSupportController.createTicket);

// Get all support tickets
router.get('/tickets', professionalHelpAndSupportController.getAllTickets);

// Get a single support ticket by ID
router.get('/tickets/:id', professionalHelpAndSupportController.getTicketById);

// Update a support ticket's status
router.put('/tickets/:id/status', professionalHelpAndSupportController.updateTicketStatus);

// Delete a support ticket
router.delete('/tickets/:id', professionalHelpAndSupportController.deleteTicket);

module.exports = router;