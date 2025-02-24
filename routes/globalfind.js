// @globalfind.js (Route)
const express = require('express');
const router = express.Router();
const globalFindController = require('../controllers/globalfind'); // Import the controller


// GET /api/globalfind?accountType=merchant
// GET /api/globalfind?accountType=merchant&userID=64f1b2c8e4b0f5a2d8f7e1a2
router.get('/globalfind', globalFindController.findByAccountTypeOrId);

module.exports = router;