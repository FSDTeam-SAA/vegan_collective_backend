const express = require("express");
const {createStoreReview, getAverageRating, getAllReviewsForSpecificStore} = require("../controllers/storeReviewForMerchant.controller");
const router = express.Router();

router.post("/store/review/create", createStoreReview);

router.get("/store/review/average/:merchantID", getAverageRating);

router.get("/store/review/all/:merchantID", getAllReviewsForSpecificStore);

module.exports = router;