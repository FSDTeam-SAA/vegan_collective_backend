const Review = require('../models/professionalReview.model');
const User = require('../models/user.model'); // Assuming you have a User model

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userID, rating, comment } = req.body;

    // Validate request body
    if (!userID || !rating) {
      return res.status(400).json({ message: "User ID and rating are required." });
    }

    // Check if rating is within the valid range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Check if the provided userID exists in the database
    const userExists = await User.findById(userID);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid User ID. User does not exist." });
    }

    // Create the review
    const newReview = new Review({
      userID,
      rating,
      comment,
    });

    // Save the review to the database
    const savedReview = await newReview.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userID', 'username email'); // Populate user details
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('userID', 'username email');
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review by ID
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate request body
    if (!rating && !comment) {
      return res.status(400).json({ message: "At least one field (rating or comment) is required for update." });
    }

    // Check if rating is within the valid range
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Check if the review exists
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // If userID is being updated, validate it
    if (req.body.userID) {
      const userExists = await User.findById(req.body.userID);
      if (!userExists) {
        return res.status(400).json({ message: "Invalid User ID. User does not exist." });
      }
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment, userID: req.body.userID },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};