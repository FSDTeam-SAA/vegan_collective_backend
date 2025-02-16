const express = require('express');
const router = express.Router();
const goLiveController = require('../controllers/professionalGoLive.controller'); // Adjust the path as needed

// Create a new GoLive event
router.post('/events', goLiveController.createGoLiveEvent);

// Get all GoLive events (publicly accessible)
router.get('/all', goLiveController.getAllGoLiveEvents);

// Get all GoLive events created by a specific user
router.get('/events/:id', goLiveController.getGoLiveEventsById);

// Update a GoLive event by ID
router.put('/events/:id', goLiveController.updateGoLiveEvent);

// Delete a GoLive event by ID
router.delete('/events/:id', goLiveController.deleteGoLiveEvent);

module.exports = router;