const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createBooking,
  getAllBookings,
  getBookingById,
} = require("../controllers/organizationEventBooking.controller");


router.post("/organizationbookings", createBooking);

router.get("/organizationbookings", getAllBookings);

router.get("/organizationbookings/:id", getBookingById);

module.exports = router;