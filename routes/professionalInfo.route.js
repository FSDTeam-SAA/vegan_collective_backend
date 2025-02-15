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
router.post("/ProfessionalInfo", createProfessionalInfo);

// Get all professional info
router.get("/ProfessionalInfo", getAllProfessionalInfo);

// Get a single professional info by ID

router.get("/ProfessionalInfo/:id", getProfessionalInfoById);

// Update professional info by ID
router.put("/professionalInfo/:id", updateProfessionalInfo);

// Delete professional info by ID
router.delete("/professionalInfo/:id", deleteProfessionalInfo);

module.exports = router;