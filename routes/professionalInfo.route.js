const express = require("express");
const {
  createProfessionalInfo,
  getAllProfessionalInfo,
  getProfessionalInfoById,
  updateProfessionalInfo,
  deleteProfessionalInfo,
} = require("../controllers/professionalInfo.controller");

const router = express.Router();

// Create a new professional info
router.post("/professionalInfo", createProfessionalInfo);

// Get all professional info with filtering, pagination, and sorting
router.get("/professionalInfo", getAllProfessionalInfo);

// Get a single professional info by ID
router.get("/professionalInfo/:id", getProfessionalInfoById);

// Update professional info by ID
router.put("/professionalInfo/:id", updateProfessionalInfo);

// Delete professional info by ID
router.delete("/professionalInfo/:id", deleteProfessionalInfo);

module.exports = router;