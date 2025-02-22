const express = require('express');
const router = express.Router();
const goliveController = require('../controllers/professionalGoLive.controller'); // Adjust the path as necessary

// Route to create a new live event
router.post('/GoLive', goliveController.createLiveEvent);

// Route to get live events based on status (upcoming or past) and userID
router.get('/GoLive', goliveController.getLiveEvents);

// Route to get a single event by ID
router.get('/GoLive/:id', goliveController.getEventById);

// Route to update all fields of an event by ID
router.put('/GoLive/:id', goliveController.updateEvent);

// Route to delete an event by ID
router.delete('/GoLive/:id', goliveController.deleteEvent);

module.exports = router;