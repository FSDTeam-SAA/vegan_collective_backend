const express = require('express');
const router = express.Router();
const goliveController = require('../controllers/professionalGoLive.controller');

// Create a new event
router.post('/goLive', goliveController.createEvent);

// Get all events (with optional filters for type and professionalID)
router.get('/goLive', goliveController.getEvents);

// Get a single event by ID
router.get('/goLive/:id', goliveController.getEventById);

// Update an event by ID
router.put('/goLive/:id', goliveController.updateEvent);

// Delete an event by ID
router.delete('/goLive/:id', goliveController.deleteEvent);

module.exports = router;