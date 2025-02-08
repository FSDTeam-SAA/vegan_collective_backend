const express = require("express");
const {
  createMerchantGoLive,
  updateMerchantGoLive,
  getAllMerchantGoLive,
  getSpecificMerchantGoLive,
  deleteMerchantGoLive,
} = require("../controllers/merchantGoLive.controller");
const router = express.Router();

router
  .route("/merchant-golive")
  .post(createMerchantGoLive)
  .get(getAllMerchantGoLive);

router
  .route("/merchant-golive/:id")
  .put(updateMerchantGoLive)
  .get(getSpecificMerchantGoLive)
  .delete(deleteMerchantGoLive);

module.exports = router;
