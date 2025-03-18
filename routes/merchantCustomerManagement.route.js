const express = require('express');
const router = express.Router();
const merchantCustomerController = require('../controllers/merchantCustomerManagement.controller');

// Define routes
router.post('/merchantCustomer', merchantCustomerController.createCustomer);
router.get('/merchantCustomer', merchantCustomerController.getAllCustomers);
router.get('/merchantCustomer/:merchantID', merchantCustomerController.getCustomerByMerchantID);
router.put('/merchantCustomer/:id', merchantCustomerController.updateCustomer);
router.delete('/merchantCustomer/:id', merchantCustomerController.deleteCustomer);

module.exports = router;
