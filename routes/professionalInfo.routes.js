const express = require("express");
const {
  createProfessionalInfo,
  getAllProfessionalInfo,
  getSpecificProfessionalInfo,
  updateProfessionalInfo,
  deleteProfessionalInfo,
} = require("../controllers/professionalInfo.controller");
const router = express.Router();

router
  .route("/professional-info")
  .post(createProfessionalInfo)
  .get(getAllProfessionalInfo);

router
  .route("/professional-info/:id")
  .get(getSpecificProfessionalInfo)
  .put(updateProfessionalInfo)
  .delete(deleteProfessionalInfo);

module.exports = router;
