const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/professionalReview.controller');

// Route to add a review
router.post('/professionalReview', reviewController.addReview);

// Route to update a review
router.put('/updateprofessionalReview/:reviewID', reviewController.updateReview);


// Route to get the average rating of a professional
router.get('/professionalReview/:professionalID', reviewController.getAverageRating);

router.get('/professionalReview', reviewController.getAllReviews);
module.exports = router;