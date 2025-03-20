const express = require("express");
const router = express.Router();
const merchantProductsReviewController = require("../controllers/merchantProductsReview.controller");

// Create a review
router.post("/merchantProductsreviews", merchantProductsReviewController.createReview);

// Get all reviews for a specific product
router.get("/merchantProductsreviews/:productID", merchantProductsReviewController.getByProductID);

// Get all reviews for a specific merchant
router.get("/merchantProductsreviews/merchant/:merchantID", merchantProductsReviewController.getByMerchantID);

//update a review
router.put("/merchantProductsreviews/:reviewID", merchantProductsReviewController.updateReview);

//delete a review
router.delete("/merchantProductsreviews/:reviewID", merchantProductsReviewController.deleteReview);


module.exports = router;
