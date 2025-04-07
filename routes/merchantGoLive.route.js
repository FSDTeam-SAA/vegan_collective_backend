const express = require('express');
const router = express.Router();
const merchantGoLiveController = require('../controllers/merchantGoLive.controller'); // Adjust the path as needed

// Create a new event
router.post('/merchantGoLive', merchantGoLiveController.createEvent);

// Get all events
router.get('/merchantGoLive', merchantGoLiveController.getAllEvents);

// Get all events by user ID
router.get('/usermerchantGoLive', merchantGoLiveController.getAllEventsByUser); // Add this line

// Get event by ID
router.get('/merchantGoLive/:id', merchantGoLiveController.getEventById);

// Update event by ID
router.put('/merchantGoLive/:id', merchantGoLiveController.updateEvent);

// Delete event by ID
router.delete('/merchantGoLive/:id', merchantGoLiveController.deleteEvent);



// Google Meet Integration Routes
// Google OAuth Routes
router.get('/auth/:merchantID', merchantGoLiveController.getAuthUrl);
router.get('/auth/callback', merchantGoLiveController.handleAuthCallback); // Add this callback 
router.post('/:merchantID/:_id/add-google-meet', merchantGoLiveController.addGoogleMeet);
router.get('/meetings/:merchantID', merchantGoLiveController.getMerchantMeetings);



module.exports = router;

// // New route for creating Google Meet
// router.post('/create-google-meet', merchantGoLiveController.createGoogleMeet);