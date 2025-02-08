const express = require("express");
const {
    getMerchantInfos,
    getMerchantInfoById,
    createMerchantInfo,
    updateMerchantInfo,
    deleteMerchantInfo,
} = require("../controllers/merchantInfo.controller");

const router = express.Router();

router.get("/allMerchant", getMerchantInfos);

router.get("/specific-merchant/:id", getMerchantInfoById);

router.post("/merchantPost", createMerchantInfo);

router.put("/update-merchant/:id", updateMerchantInfo);

router.delete("/deleteMerchant/:id", deleteMerchantInfo);

module.exports = router;