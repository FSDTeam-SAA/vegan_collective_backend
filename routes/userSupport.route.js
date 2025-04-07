const express = require('express');
const router = express.Router();
const usersupportController = require('../controllers/userSupport.controller'); // Adjust the path as necessary

// Create a new ticket
router.post('/usertickets', usersupportController.createTicket);

// Get all tickets
router.get('/usertickets', usersupportController.getAllTickets);

// Get all tickets by userID
router.get('/usertickets/user/:userID', usersupportController.getTicketsByUserId);

// Get a single ticket by ID
router.get('/usertickets/:id', usersupportController.getTicketById);

// Update a ticket by ID
router.put('/usertickets/:id', usersupportController.updateTicket);

// Delete a ticket by ID
router.delete('/usertickets/:id', usersupportController.deleteTicket);

module.exports = router;