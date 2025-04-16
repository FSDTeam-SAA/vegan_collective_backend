const express = require('express');
const router = express.Router();
const userOverviewController = require('../controllers/userOverviewController');

// Route to get user overview
router.get('/overview/:userId', userOverviewController.getUserOverview);

module.exports = router;