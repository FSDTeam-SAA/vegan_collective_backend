const express = require("express");
const router = express.Router();
const merchantInfoController = require("../controllers/merchantInfo.controller");
const {  uploadMerchantImages} = require("../utils/grobalupload.controller");

// Create a new merchant info
router.post("/merchant", merchantInfoController.createMerchantInfo);

// Upload images to Cloudinary and update merchantinfo
router.put("/merchant/uploadImages", uploadMerchantImages);

// Get all merchant info with optional filters
router.get("/merchant", merchantInfoController.getAllMerchantInfo);

// Get a single merchant info by ID
router.get("/merchant/:userID", merchantInfoController.getMerchantInfoByMerchantID);

// Update a merchant info by ID
router.put("/merchant/:id", merchantInfoController.updateMerchantInfo);

// Delete a merchant info by ID
router.delete("/merchant/:id", merchantInfoController.deleteMerchantInfo);

// All stripeAccountId
router.post('/stripe/account-id', merchantInfoController.addAccountIdController)

router.post('/remove/account-id', merchantInfoController.removeAccountIdController)

router.get('/checkAccountId/:userID', merchantInfoController.checkAccountId)

// top merchant
router.get('/top-merchants', merchantInfoController.getTopMerchants)

router.get(
  '/top-merchants/byReferrals',
  merchantInfoController.getTopMerchantsByReferral
)

module.exports = router;