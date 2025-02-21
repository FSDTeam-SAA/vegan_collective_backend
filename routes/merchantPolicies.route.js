const express = require('express')
const router = express.Router()
const merchantPolicyController = require('../controllers/merchantPolicies.controller')

// Create a new policy
router.post('/merchantPolicy', merchantPolicyController.createPolicy)

// Get all policies
router.get('/merchantPolicy', merchantPolicyController.getAllPolicies)

// Get a single policy by ID
router.get('/merchantPolicy/:id', merchantPolicyController.getPolicyById)

// Update a policy by ID
router.put('/merchantPolicy/:id', merchantPolicyController.updatePolicy)

// Delete a policy by ID
router.delete('/merchantPolicy/:id', merchantPolicyController.deletePolicy)

module.exports = router
