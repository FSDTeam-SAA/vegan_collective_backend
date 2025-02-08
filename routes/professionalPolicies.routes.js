const express = require("express");
const router = express.Router();
const professionalPoliciesController = require("../controllers/professionalPolicies.controller");

// Route to create or update professional policies
router.post("/professional-policies", professionalPoliciesController.createOrUpdateProfessionalPolicies);

// Route to get all professional policies
router.get("/professional-policies", professionalPoliciesController.getAllProfessionalPolicies);
// Route to get professional policies by professionalID
router.get("/professional-policies/:professionalID", professionalPoliciesController.getProfessionalPolicies);

module.exports = router;