const express = require('express');
const zoomController = require('../controllers/zoomController');
const router = express.Router();

// Redirect to Zoom OAuth URL
router.get('/oauth', zoomController.getOAuthUrl); // Redirect to Zoom OAuth

// Handle Zoom OAuth callback
router.get('/callback', zoomController.handleCallback); // Handle Zoom OAuth callback

// Create a Zoom meeting
router.post('/meetings', zoomController.createMeeting); // Create a Zoom meeting

// Add more routes as needed (e.g., listing meetings, updating meetings, etc.)

module.exports = router;