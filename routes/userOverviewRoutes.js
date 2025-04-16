const express = require('express');
const router = express.Router();
const getUserOverview = require('../controllers/userOverviewController');

// Route to get user overview
router.get('/overview/:userId', getUserOverview.getUserOverview);

module.exports = router;