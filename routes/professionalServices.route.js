const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { createService, getAllServices, getOfflineServices, getLiveServices, updateService, deleteService } = require("../controllers/professionalServices.controller");

// Route to create a new service
router.post(
  "/createservice",
  upload.fields([
    { name: "serviceImage", maxCount: 1 },
    { name: "serviceVideo", maxCount: 1 },
  ]),
  createService
);

// Route to get all services
router.get("/allservices", getAllServices);

// Route to get offline services
router.get("/offlineservices", getOfflineServices);

// Route to get live services
router.get("/liveservices", getLiveServices);

// Route to update a service by ID
router.put(
  "/updateservice/:id",
  upload.fields([
    { name: "serviceImage", maxCount: 1 },
    { name: "serviceVideo", maxCount: 1 },
  ]),
  updateService
);

// Route to delete a service by ID
router.delete("/deleteservice/:id", deleteService);



module.exports = router;
