const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByOrganizationAndType,
} = require("../controllers/organizationGoLive.controller");

// Route to create a new event
router.post("/organizationGoLive", createEvent);

// Route to get events (upcoming or past) based on query parameters
router.get("/organizationGoLive", getEvents);

// Route to get a specific event by ID
router.get("/organizationGoLive/:id", getEventById);
// Route to update an event by ID
router.put("/organizationGoLive/:id", updateEvent);
// Route to delete an event by ID
router.delete("/organizationGoLive/:id", deleteEvent);

// New route to get events by organizationID and eventType (paid/free)
router.get("/byOrganizationAndType", getEventsByOrganizationAndType)

module.exports = router;