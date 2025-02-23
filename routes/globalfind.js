const express = require('express');
const router = express.Router();
const { globalFind } = require('../controllers/globalfind');

// Global Find API
router.get('/globalFindApi', globalFind);

module.exports = router;