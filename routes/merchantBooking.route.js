const express = require('express');
const router = express.Router();
const merchantBookingController = require('../controllers/merchantBooking.controller');

// Get all bookings for a specific merchant
router.get('/booking/:merchantID', merchantBookingController.getMerchantBookings);

// routes/booking.routes.js
router.put('/order/tracking/:merchantID', merchantBookingController.updateTrackingNumber);



module.exports = router;