const express = require('express');
const zoomController = require('../controllers/zoomController');

const router = express.Router();

router.post('/create-meeting', zoomController.createMeeting);

module.exports = router;