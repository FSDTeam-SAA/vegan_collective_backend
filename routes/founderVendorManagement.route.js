const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/founderVendorManagement.controller');

// Get all vendors
router.get('/vendors', vendorController.getAllVendors);

// Get vendor by ID
router.get('/vendors/:id', vendorController.getVendorById);

// Create a new vendor
router.post('/vendors', vendorController.createVendor);

// Update vendor status
router.put('/vendors/:id/status', vendorController.updateVendorStatus);

// Delete a vendor
router.delete('/vendors/:id', vendorController.deleteVendor);

module.exports = router;