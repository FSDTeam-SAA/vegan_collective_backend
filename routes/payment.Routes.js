const express = require('express')
const { savePaymentMethod } = require('../controllers/payment.Controller')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const route = express.Router()

route.post('/save-payment-method', savePaymentMethod)
module.exports = route