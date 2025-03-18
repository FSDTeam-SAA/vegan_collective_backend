const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/professionalReview.controller');

// Route to add a review
router.post('/professionalReview', reviewController.addReview);

// Route to get all reviews
router.get('/professionalReview', reviewController.getAllReviews);

// Route to get reviews of a professional by professionalID
router.get('/professionalReview/:professionalID', reviewController.getReviewsOfProfessional);



// router.get('/professionalReview', reviewController.getAllReviews);

// Route to get top professionals based on average ratings

router.get('/top-professionals', reviewController.getTopProfessionals);


module.exports = router;