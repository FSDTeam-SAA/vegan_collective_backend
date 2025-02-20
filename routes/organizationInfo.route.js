const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationInfo.controller");
const { uploadOrganizationImages } = require("../utils/grobalupload.controller");

// Create Organization Info
router.post("/organization", organizationController.createOrganizationInfo);

// Upload images to Cloudinary and update organizationinfo
router.put("/organization/uploadImages", uploadOrganizationImages);

// Get All Organizations
router.get("/organization", organizationController.getAllOrganizationInfo);

// Get Single Organization by ID
router.get("/organization/:id", organizationController.getOrganizationInfoById);

// Update Organization Info
router.put("/organization/:id", organizationController.updateOrganizationInfo);

// Delete Organization Info
router.delete("/organization/:id", organizationController.deleteOrganizationInfo);

module.exports = router;
