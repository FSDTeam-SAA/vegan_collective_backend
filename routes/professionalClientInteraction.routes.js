const express = require('express');
const router = express.Router();
const professionalClientInteractionController = require('../controllers/professionalClientInteraction.controller');

// Create a new interaction
router.post('/professional-client-interaction', professionalClientInteractionController.createInteraction);

// Get all interactions
router.get('/professional-client-interaction', professionalClientInteractionController.getAllInteractions);

// Update an interaction by ID
router.put('/professional-client-interaction/:id', professionalClientInteractionController.updateInteraction);

// Delete an interaction by ID
router.delete('/professional-client-interaction/:id', professionalClientInteractionController.deleteInteraction);

module.exports = router;