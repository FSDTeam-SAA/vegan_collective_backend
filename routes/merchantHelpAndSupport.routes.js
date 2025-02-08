const express = require("express");
const {
    getMerchantHelpAndSupports,
    getMerchantHelpAndSupportById,
    createMerchantHelpAndSupport,
    updateMerchantHelpAndSupport,
    deleteMerchantHelpAndSupport,
} = require("../controllers/merchantHelpAndSupport.controller");

const router = express.Router();

router.get("/allMerchantHelpAndSupport", getMerchantHelpAndSupports);

router.get("/specific-merchantHelpAndSupport/:id", getMerchantHelpAndSupportById);

router.post("/merchantHelpAndSupportPost", createMerchantHelpAndSupport);

router.put("/update-merchantHelpAndSupport/:id", updateMerchantHelpAndSupport);

router.delete("/deleteMerchantHelpAndSupport/:id", deleteMerchantHelpAndSupport);


module.exports = router;