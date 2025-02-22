const express = require("express");
const router = express.Router();
const organizationFundraisingManagementController = require("../controllers/organizationFundraisingManagement.controller");

// Create a new fundraising campaign
router.post("/campaigns", organizationFundraisingManagementController.createCampaign);

// Get all fundraising campaigns
router.get("/campaigns", organizationFundraisingManagementController.getAllCampaigns);

// Get a single fundraising campaign by ID
router.get("/campaigns/:id", organizationFundraisingManagementController.getCampaignById);

// Update a fundraising campaign by ID
router.put("/campaigns/:id", organizationFundraisingManagementController.updateCampaign);

// Delete a fundraising campaign by ID
router.delete("/campaigns/:id", organizationFundraisingManagementController.deleteCampaign);

module.exports = router;