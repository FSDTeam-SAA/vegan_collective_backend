const express = require('express');
const router = express.Router();
const eventController = require('../controllers/professionalGoLive.controller'); // Import the controller

// CREATE: Add a new event
router.post('/events', eventController.addNewEvent);

// READ: Get all events
router.get('/events', eventController.getAllEvents);

// READ: Get a single event by ID
router.get('/events/:id', eventController.getEventById);

// UPDATE: Update an event by ID
router.put('/events/:id', eventController.updateEvent);

// DELETE: Delete an event by ID
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;