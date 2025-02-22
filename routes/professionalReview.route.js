const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/professionalReview.controller');

// Create a new review
router.post('/reviews', reviewController.createReview);

// Get all reviews
router.get('/reviews', reviewController.getAllReviews);

// Get a single review by ID
router.get('/reviews/:id', reviewController.getReviewById);

// Update a review by ID
router.put('/reviews/:id', reviewController.updateReview);

// Delete a review by ID
router.delete('/reviews/:id', reviewController.deleteReview);

// Get average rating for a professional
router.get('/reviews/professional/:professionalID/average-rating', reviewController.getAverageRating);

module.exports = router;