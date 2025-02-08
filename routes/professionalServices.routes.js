const express = require("express");

const {
    getProfessionalServices,
    getProfessionalServiceById,
    createProfessionalService,
    updateProfessionalService,
    deleteProfessionalService,
} = require("../controllers/professionalServices.controller");

const router = express.Router();

router.get("/allProfessionalServices", getProfessionalServices);

router.get("/specific-professionalServices/:id", getProfessionalServiceById);

router.post("/professionalServicesPost", createProfessionalService);

router.put("/update-professionalServices/:id", updateProfessionalService);

router.delete("/deleteProfessionalServices/:id", deleteProfessionalService);


module.exports = router;