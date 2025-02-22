const Review = require('../models/professionalReview.model'); // Import the Review model
const mongoose = require('mongoose'); // Import mongoose for the ObjectId validation
const User = require('../models/user.model'); // Import the User model


// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userID, professionalID, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({ status: false, error: "Invalid professional ID" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ status: false, error: "Rating must be between 1 and 5" });
    }

    const review = new Review({ userID, professionalID, rating, comment });
    await review.save();

    res.status(201).json({ status: true, message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Get all reviews for a specific professional
exports.getReviewsByProfessional = async (req, res) => {
  try {
    const { professionalID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({ status: false, error: "Invalid professional ID" });
    }

    const reviews = await Review.find({ professionalID }).populate("userID", "name email");

    res.status(200).json({ status: true, reviews });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const review = await Review.findById(reviewID).populate("userID", "name email");

    if (!review) {
      return res.status(404).json({ status: false, error: "Review not found" });
    }

    res.status(200).json({ status: true, review });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ status: false, error: "Rating must be between 1 and 5" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewID,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ status: false, error: "Review not found" });
    }

    res.status(200).json({ status: true, message: "Review updated successfully", updatedReview });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const deletedReview = await Review.findByIdAndDelete(reviewID);

    if (!deletedReview) {
      return res.status(404).json({ status: false, error: "Review not found" });
    }

    res.status(200).json({ status: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Get average rating for a professional
exports.getAverageRating = async (req, res) => {
  try {
    const { professionalID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({ status: false, error: "Invalid professional ID" });
    }

    const result = await Review.aggregate([
      { $match: { professionalID: new mongoose.Types.ObjectId(professionalID) } },
      { $group: { _id: "$professionalID", averageRating: { $avg: "$rating" } } }
    ]);

    const averageRating = result.length === 0 ? 0 : result[0].averageRating.toFixed(2);

    res.status(200).json({ status: true, professionalID, averageRating });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
