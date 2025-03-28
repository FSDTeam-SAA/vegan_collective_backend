const express = require('express');
const router = express.Router();
const merchantBookingController = require('../controllers/merchantBooking.controller');

// Get all bookings for a specific merchant
router.get('/booking/:merchantID', merchantBookingController.getMerchantBookings);

// // routes/booking.routes.js
// router.put('/order/tracking/:orderId', merchantBookingController.updateTrackingNumber);

// New route for updating booking
router.put('/order/tracking/:orderId', merchantBookingController.updateBooking);



module.exports = router;