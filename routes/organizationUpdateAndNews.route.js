const express = require("express");
const router = express.Router();
const { createOrganizationUpdate, getAllOrganizationUpdates,getAllOrganizationUpdatesByOrganizationID, getOrganizationUpdateById } = require("../controllers/organizationUpdateAndNews.controller");
const upload = require("../utils/multerConfig"); 

// Route to create a new organization update (image upload + data store)
router.post("/createOrganizationUpdate", upload.single("image"), createOrganizationUpdate);

// Get all organization updates
router.get("/createOrganizationUpdate",getAllOrganizationUpdates );

// Get a specific organization update by ID
router.get("/organizationUpdateAndNews/:organizationID", getAllOrganizationUpdatesByOrganizationID);




// Get a specific organization update by ID
router.get("/createOrganizationUpdate/:id", getOrganizationUpdateById);

module.exports = router;
