const express = require('express')
const {
  savePaymentMethod,
  purchaseMethod,
  webhookController,
  createCustomer,
} = require('../controllers/payment.Controller')

const route = express.Router()
route.post('/create-customer', createCustomer)
route.post('/save-payment-method', savePaymentMethod)
route.post('/purchase', purchaseMethod)
route.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookController
)

module.exports = route
