const express = require("express");
const {
  createProfessionalInfo,
  getAllProfessionalInfo,
  getProfessionalInfoByUserId,
  updateProfessionalInfo,
  deleteProfessionalInfo,
} = require("../controllers/professionalInfo.controller");
const { uploadImages } = require("../utils/grobalupload.controller");

const router = express.Router();

// Create a new professional info
router.post("/professionalInfo", createProfessionalInfo);

// Upload images to Cloudinary and update Professionalinfo
router.put("/professionalInfo/uploadImages", uploadImages);

// Get all professional info with filtering, pagination, and sorting
router.get("/professionalInfo", getAllProfessionalInfo);

// Get a single professional info by ID
router.get("/professionalInfo/:userId", getProfessionalInfoByUserId);

// Update professional info by ID
router.put("/professionalInfo/:id", updateProfessionalInfo);

// Delete professional info by ID
router.delete("/professionalInfo/:id", deleteProfessionalInfo);

module.exports = router;