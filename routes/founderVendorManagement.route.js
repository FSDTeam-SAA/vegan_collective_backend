// routes/dataRoutes.js
const express = require("express");
const router = express.Router();
const fetchDataController = require("../controllers/founderVendorManagement.controller");

// Route to fetch required data
router.get("/fetch-data", fetchDataController.fetchRequiredData);

// Route to fetch data where isVerified is "pending"
router.get("/fetch-pending-data", fetchDataController.fetchPendingVerificationData);

// New route for updating verification status (using PUT)
router.put('/update-verification-status', fetchDataController.updateVerificationStatus);

module.exports = router;