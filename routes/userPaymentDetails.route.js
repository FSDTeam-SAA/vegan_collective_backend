const express = require('express')
const router = express.Router()
const {
  getUserPaymentsByService,
  getProfessionalPaymentsWithBooking,
  updatePaymentStatus,
} = require('../controllers/userPaymentDetails.controller')

// Route to get user payments by service
router.get(
  '/payments/user-bookings',
  getUserPaymentsByService
);


// Route to get payments for Professionals with serviceBookingTime
router.get(
  '/payments/professional-bookings',
  getProfessionalPaymentsWithBooking
);
// Route to update payment status
router.patch('/payments/update-status', updatePaymentStatus)

module.exports = router
