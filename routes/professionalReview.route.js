const express = require('express');
const reviewController = require('../controllers/professionalReview.controller');

const router = express.Router();

// Create a new review
router.post('/professionalReview', reviewController.createReview);

// Get all reviews for a professional
router.get('/professionalReview/:professionalID', reviewController.getReviewsByProfessional);

// Get the average rating of a professional
router.get('/reviews/average-rating/:professionalID', reviewController.getAverageRating);

module.exports = router;