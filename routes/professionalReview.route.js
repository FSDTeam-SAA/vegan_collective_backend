const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/professionalReview.controller');


// Create a new review (requires authentication)
router.post('/reviews', reviewController.createReview);

// Get all reviews
router.get('/reviews', reviewController.getAllReviews);

// Get a single review by ID
router.get('/reviews/:id', reviewController.getReviewById);

// Update a review by ID (requires authentication)
router.put('/reviews/:id',reviewController.updateReview);

// Delete a review by ID (requires authentication)
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;