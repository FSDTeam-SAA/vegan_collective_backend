const express = require('express')
const {
  addStripeAccountId,
  removeStripeAccountId,
} = require('../controllers/stripeAccount.Controller')

const router = express.Router()

router.post('/add-stripe-account', addStripeAccountId)
router.post('/remove-stripe-account', removeStripeAccountId)

module.exports = router
