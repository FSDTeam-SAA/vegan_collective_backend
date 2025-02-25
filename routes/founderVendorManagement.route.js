const express = require('express');
const router = express.Router();
const founderVendonManagementController = require('../controllers/founderVendorManagement.controller');

// Routes
router.get('/professionals', founderVendonManagementController.getProfessionalInfo);
router.get('/merchants', founderVendonManagementController.getMerchantInfo);
router.get('/organizations', founderVendonManagementController.getOrganizationInfo);

module.exports = router;