const express = require('express');
const router = express.Router();
const eventController = require('../controllers/organizationEventManagement.controller'); // Adjust the path as needed

// Add a new event
router.post('/organizationevents', eventController.addEvent);

// Get all events with pagination, search, and filtering
router.get('/organizationevents', eventController.getEvents);

// Get a single event by ID
router.get('/organizationevents/:id', eventController.getEventById);

// Update an event by ID
router.put('/organizationevents/:id', eventController.updateEvent);

// Delete an event by ID
router.delete('/organizationevents/:id', eventController.deleteEvent);

// get all events with pagination, search, and filtering
router.get('/organizationevents', eventController.getAllEvents);

// get events by organization
router.get('/organizationeventsbyorganization/:organizationID', eventController.getEventsByOrganization);

// Route to get event counts by organization ID
router.get("/events/count/:organizationID", eventController.getEventsCountByOrganization);

// get events by type
router.get('/organizationeventsbytype/:eventType', eventController.getEventsByTypeBoth);

module.exports = router;