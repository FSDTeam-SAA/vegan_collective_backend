const express = require('express');
const router = express.Router();
const userGoLiveController = require('../controllers/userGoLive.controller.js');

// Check user's purchased organization GoLive events
router.get('/findgolive/:userID', userGoLiveController.checkUserGoLivePurchase);

module.exports = router;