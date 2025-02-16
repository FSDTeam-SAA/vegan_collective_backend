const express = require('express');
const router = express.Router();
const professionalServicesController = require('../controllers/professionalServices.controller');

// Create a new professional service
router.post('/service', professionalServicesController.createProfessionalService);

// Get all professional services
router.get('/service', professionalServicesController.getAllProfessionalServices);

// Get a single professional service by ID
router.get('/service/:id', professionalServicesController.getProfessionalServiceById);

// Update a professional service
router.put('/service/:id', professionalServicesController.updateProfessionalService);

// Delete a professional service
router.delete('/service/:id', professionalServicesController.deleteProfessionalService);

module.exports = router;