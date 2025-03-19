const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');

// GET all events
router.get('/events', getEvents);

// POST a new event
router.post('/events', createEvent);

module.exports = router;