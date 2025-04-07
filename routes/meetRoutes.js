const express = require('express');
const router = express.Router();
const meetController = require('../controllers/meetController');
const merchantGoLiveController = require('../controllers/merchantGoLive.controller');
const path = require('path');

// Merchant-specific routes
router.get('/api/v1/auth/:merchantID', merchantGoLiveController.getAuthUrl);
router.post('/api/v1/:merchantID/:_id/add-google-meet', merchantGoLiveController.addGoogleMeet);
router.get('/meetings/:merchantID', merchantGoLiveController.getMerchantMeetings);

// Original routes
router.get('/auth', meetController.getAuthUrl);
router.get('/auth/callback', merchantGoLiveController.handleAuthCallback);
router.post('/create-meeting', meetController.createMeeting);
router.get('/meetings', meetController.getMeetings);

// Serve frontend
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'meet.html'));
});

module.exports = router;