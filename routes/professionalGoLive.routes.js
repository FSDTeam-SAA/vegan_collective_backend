const express = require('express');
const router = express.Router();
const professionalGoLiveController = require('../controllers/professionalGoLive.controller');

// Create a new event
router.post('/events', professionalGoLiveController.createEvent);

// Get all events
router.get('/events', professionalGoLiveController.getAllEvents);

// Get a single event by ID
router.get('/events/:id', professionalGoLiveController.getEventById);

// Update an event by ID
router.put('/events/:id', professionalGoLiveController.updateEvent);

// Delete an event by ID
router.delete('/events/:id', professionalGoLiveController.deleteEvent);

module.exports = router;