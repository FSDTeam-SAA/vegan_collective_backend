const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createBooking,
  getAllBookings,
  getBookingsByEventId,

} = require("../controllers/organizationEventBooking.controller");


router.post("/organizationbookings", createBooking);

router.get("/organizationbookings", getAllBookings);

router.get("/bookings/event/:eventId", getBookingsByEventId);



module.exports = router;