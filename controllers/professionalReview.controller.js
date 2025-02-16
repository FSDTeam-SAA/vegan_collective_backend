const Review = require('../models/professionalReview.model'); // Import the Review model
const mongoose = require('mongoose'); // Import mongoose for the ObjectId validation
const User = require('../models/user.model'); // Import the User model

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userID, rating, comment } = req.body;

    // Check if the user exists and is of type "professional"
    const user = await User.findById(userID);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    if (user.accountType !== 'professional') {
      return res.status(403).json({
        success: false,
        message: 'This user is not a professional',
      });
    }

    // Create the review
    const review = new Review({
      userID,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userID', 'name email accountType');

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('userID', 'name email accountType');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find the review by ID
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Update the review fields if provided in the request body
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    // Save the updated review
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the request parameters

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    // Find the review by ID
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(id); // Use findByIdAndDelete for simplicity

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};