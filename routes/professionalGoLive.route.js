const express = require('express');
const router = express.Router();
const goLiveController = require('../controllers/professionalGoLive.controller');

// Route to create a new event
router.post('/create', goLiveController.createEvent);

// Route to get all events (optionally filtered by userId)
router.get('/create', goLiveController.getAllEvents);

// Route to get a single event by ID
router.get('/:eventId', goLiveController.getEvent);

// Route to update an existing event
router.put('/update', goLiveController.updateEvent);

// Route to delete an event
router.delete('/delete', goLiveController.deleteEvent);





module.exports = router;