const express = require('express')
const router = express.Router()
const { checkUserPayment } = require('../controllers/checkUserPayment.controller')

router.post('/user-payment', checkUserPayment)

module.exports = router
