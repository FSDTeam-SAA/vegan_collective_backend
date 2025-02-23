const express = require('express');
const router = express.Router();
const eventController = require('../controllers/organizationEventManagement.controller'); // Adjust the path as needed

// Add a new event
router.post('/organizationevents', eventController.addEvent);

// Get all events with pagination, search, and filtering
router.get('/organizationevents', eventController.getEvents);

// Get a single event by ID
router.get('/organizationevents/:id', eventController.getEventById);

// Update an event by ID
router.put('/organizationevents/:id', eventController.updateEvent);

// Delete an event by ID
router.delete('/organizationevents/:id', eventController.deleteEvent);

// get all events with pagination, search, and filtering
router.get('/organizationevents', eventController.getAllEvents);

module.exports = router;