const express = require('express');
const router = express.Router();
const organizationsupportController = require('../controllers/organizationSupport.controller');

// Create a new support ticket
router.post('/organizationsupport', organizationsupportController.createSupportTicket);

// Get all support tickets
router.get('/organizationsupport', organizationsupportController.getAllSupportTickets);

// Get a single support ticket by ID
router.get('/organizationsupport/:id', organizationsupportController.getSupportTicketById);

// Update a support ticket by ID
router.put('/organizationsupport/:id', organizationsupportController.updateSupportTicket);

// Delete a support ticket by ID
router.delete('/organizationsupport/:id', organizationsupportController.deleteSupportTicket);

module.exports = router;