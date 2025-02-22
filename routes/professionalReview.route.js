const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/professionalReview.controller');


// Create a new review
router.post("/professionalReview", reviewController.createReview);

// Get all reviews for a specific professional
router.get("/professionalReview/:professionalID", reviewController.getReviewsByProfessional);

// Get a single review by ID
router.get("/professionalReview/:reviewID", reviewController.getReviewById);

// Update a review
router.put("/professionalReview/:reviewID", reviewController.updateReview);

// Delete a review
router.delete("/professionalReview/:reviewID", reviewController.deleteReview);

// Get average rating for a professional
router.get("/professionalReviewaverage/:professionalID", reviewController.getAverageRating);

module.exports = router;