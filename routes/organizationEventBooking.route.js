const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createBooking,
  getAllBookings,
} = require("../controllers/organizationEventBooking.controller");


router.post("/organizationbookings", createBooking);

router.get("/organizationbookings", getAllBookings);

module.exports = router;