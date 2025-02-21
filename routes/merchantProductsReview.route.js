const express = require("express");
const router = express.Router();
const merchantProductsReviewController = require("../controllers/merchantProductsReview.controller");

// Create a review
router.post("/merchantProductsreviews", merchantProductsReviewController.createReview);

// Get all reviews for a specific product
router.get("/merchantProductsreviews/:productID", merchantProductsReviewController.getReviewsByProduct);

// Get average rating for a specific product
router.get("/merchantProductsreviews/:productID/average", merchantProductsReviewController.getAverageRating);

// Update a review
router.put("/merchantProductsreviews/:reviewID", merchantProductsReviewController.updateReview);

// Delete a review
router.delete("/merchantProductsreviews/:reviewID", merchantProductsReviewController.deleteReview);

module.exports = router;
