const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// Route to create a new review
router.post('/reviews', reviewController.createReview);

// Route to get all reviews
router.get('/reviews', reviewController.getAllReviews);

// Route to get a single review by ID
router.get('/reviews/:id', reviewController.getReviewById);

// Route to update a review by ID
router.put('/reviews/:id', reviewController.updateReview);

// Route to delete a review by ID
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;