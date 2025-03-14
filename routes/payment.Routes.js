const express = require('express')
const {
  savePaymentMethod,
  purchaseMethod,
  webhookController,
  removePaymentMethod,
  confirmBooking,
  getBookingDetailsByUserID,

} = require('../controllers/payment.Controller')

const route = express.Router()

route.post('/save-payment-method', savePaymentMethod)
route.post('/purchase', purchaseMethod)
route.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookController
)
route.post('/confirm-booking', confirmBooking)
route.get('/booking-details/:userID', getBookingDetailsByUserID)

route.post('/remove-payment-method', removePaymentMethod)

module.exports = route
