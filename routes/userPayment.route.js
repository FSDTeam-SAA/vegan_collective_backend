const express = require('express')
const {  createUserPayment,  getUserPaymentByUserId,  updateUserPayment,  deleteUserPayment} = require('../controllers/userPayment.controller')
const router = express.Router()
router.post('/create-payment', createUserPayment)
router.get('/get-payment/:userID', getUserPaymentByUserId)
router.put('/update-payment/:id', updateUserPayment)
router.delete('/delete-payment/:id', deleteUserPayment)
module.exports = router
