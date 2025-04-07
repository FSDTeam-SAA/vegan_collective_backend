const express = require('express')
const {
  savePaymentMethod,
  purchaseMethod,
  removePaymentMethod,
  confirmBooking,
  getBookingDetailsByUserID,
  getCalendarData,
  getProfessionalCalendarData,
  checkPaymentMethodAddOrNot,

} = require('../controllers/payment.Controller')

const route = express.Router()

route.post('/save-payment-method', savePaymentMethod)
route.post('/purchase', purchaseMethod)

route.post('/confirm-booking', confirmBooking)
route.get('/booking-details/:userID', getBookingDetailsByUserID)
route.get('/calendar/:userID', getCalendarData);

route.get("/calendar/professional/:professionalId", getProfessionalCalendarData);

route.post('/remove-payment-method', removePaymentMethod)

route.get('/check-payment-method/:userId', checkPaymentMethodAddOrNot)


module.exports = route
