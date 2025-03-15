const express = require('express')
const router = express.Router()
const {
  getUserPaymentsByService,
  getProfessionalPaymentsWithBooking,
  updatePaymentStatus,
} = require('../controllers/userPaymentDetails.controller')

// for professional service
router.post('/payments/by-service', getUserPaymentsByService)

// Route to get payments for Professionals with serviceBookingTime
router.post(
  '/payments/professional-bookings',
  getProfessionalPaymentsWithBooking
)

// Route to update payment status
router.patch('/payments/update-status', updatePaymentStatus)

module.exports = router
