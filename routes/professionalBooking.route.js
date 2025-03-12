const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/professionalBooking.controller');

// Create a new booking
router.post('/bookings', bookingController.createBooking);

// Get all bookings
router.get('/bookings', bookingController.getAllBookings);

// Get a single booking by ID
// router.get('/bookings/:userID', bookingController.getBookingById);

// Get bookings by userID or serviceID
router.get('/bookings/filter', bookingController.getBookingsByFilter);

// Update a booking by ID
router.put('/bookings/:userId', bookingController.updateBookingByUserId);

// Delete a booking by ID
router.delete('/bookings/:userId', bookingController.deleteBookingByUserId);

module.exports = router;