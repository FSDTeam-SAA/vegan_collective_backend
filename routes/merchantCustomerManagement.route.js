const express = require('express');
const router = express.Router();
const merchantCustomerController = require('../controllers/merchantCustomerManagement.controller');

// Define routes
router.post('/merchantCustomer', merchantCustomerController.createCustomer);
router.get('/merchantCustomer', merchantCustomerController.getAllCustomers);
// router.get('/merchantCustomer/:id', merchantCustomerController.getCustomerById);
router.get('/merchantCustomer/:merchantID', merchantCustomerController.getCustomerByMerchantID);
router.put('/merchantCustomer/:id', merchantCustomerController.updateCustomer);

router.delete('/merchantCustomer/:id', merchantCustomerController.deleteCustomer);

// customer order product  management
router.get('/product-order-management', merchantCustomerController.customerOrderProductData)
 

module.exports = router;
