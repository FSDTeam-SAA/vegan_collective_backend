const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { createService, getAllServices, getOfflineServices, getLiveServices, updateService, deleteService,getUserServices,getOfflineServicesByProfessionalId,getOnlineServicesByProfessionalId } = require("../controllers/professionalServices.controller");

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

router.get("/allservices/:userID", getUserServices);


// Route to delete a service by ID
router.delete("/deleteservice/:id", deleteService);


// Get offline services by professional ID (1-on-1 session or Group session)
router.get("/offline/:userID", getOfflineServicesByProfessionalId);

// Get online services by professional ID (Webinar only)
router.get("/online/:userID", getOnlineServicesByProfessionalId);



module.exports = router;
