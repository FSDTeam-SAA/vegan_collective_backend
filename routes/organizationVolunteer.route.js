const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createVolunteer,
  getAllVolunteers,
  getVolunteersByEventId
} = require("../controllers/organizationvolunteer.controller");


router.post("/organizationvolunteers", createVolunteer); 

router.get("/organizationvolunteers", getAllVolunteers);

router.get("/organizationvolunteers/:eventId", getVolunteersByEventId);

module.exports = router;