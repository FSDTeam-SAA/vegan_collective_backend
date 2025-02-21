const express = require('express');
const router = express.Router();
const merchantGoLiveController = require('../controllers/merchantGoLive.controller'); // Adjust the path as needed

// Create a new event
router.post('/merchantGoLive', merchantGoLiveController.createEvent);

// Get all events
router.get('/merchantGoLive', merchantGoLiveController.getAllEvents);

// Get event by ID
router.get('/merchantGoLive/:id', merchantGoLiveController.getEventById);

// Update event by ID
router.put('/merchantGoLive/:id', merchantGoLiveController.updateEvent);

// Delete event by ID
router.delete('/merchantGoLive/:id', merchantGoLiveController.deleteEvent);

module.exports = router;