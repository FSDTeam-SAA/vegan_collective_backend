const express = require('express');
const router = express.Router();
const professionalPolicyController = require('../controllers/professionalPolicies.controller');

// Create a new professional policy
router.post('/policies', professionalPolicyController.createProfessionalPolicy);

// Get all professional policies
router.get('/policies', professionalPolicyController.getAllProfessionalPolicies);

// Get a single professional policy by ID
router.get('/policies/:id', professionalPolicyController.getProfessionalPolicyById);

// Update a professional policy by ID
router.put('/policies/:id', professionalPolicyController.updateProfessionalPolicy);

// Delete a professional policy by ID
router.delete('/policies/:id', professionalPolicyController.deleteProfessionalPolicy);

module.exports = router;