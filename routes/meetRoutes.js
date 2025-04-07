// routes/meetRoutes.js
const express = require('express');
const router = express.Router();
const meetController = require('../controllers/googleMeetController');

// Authentication routes
router.get('/auth', meetController.getAuthUrl);
router.get('/auth/callback', meetController.handleAuthCallback);

// Meeting routes
router.post('/create-meeting', meetController.createMeeting);

// Get all meetings
router.get('/meetings', meetController.getMeetings);

module.exports = router;