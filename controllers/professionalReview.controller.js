const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/professionalReview.model");
const User = require("../models/user.model");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userID, professionalID, rating, comment } = req.body;

    // Validate input
    if (!userID || !professionalID || !rating) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if the user has already reviewed this professional
    const existingReview = await Review.findOne({ userID, professionalID });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this professional.' });
    }

    // Create the review
    const newReview = new Review({ userID, professionalID, rating, comment });
    await newReview.save();

    res.status(201).json({ success: true, message: 'Review created successfully.', data: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all reviews
// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userID', 'name') // Populate user details
      .populate('professionalID', 'name'); // Populate professional details
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userID', 'userID') // Populate user details
      .populate('professionalID'); // Populate professional details
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('userID', 'name').populate('professionalID', 'name');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update a review by ID
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate input
    if (!rating && !comment) {
      return res.status(400).json({ success: false, message: 'At least one field is required to update.' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, message: 'Review updated successfully.', data: updatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Calculate average rating for a professional



exports.getAverageRating = async (req, res) => {
  try {
    const { professionalID } = req.params;

    // Validate the professionalID
    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({ success: false, message: 'Invalid professionalID.' });
    }

    // Log the incoming professionalID for debugging
    console.log('Professional ID:', professionalID);

    // Aggregate to calculate the average rating
    const result = await Review.aggregate([
      { $match: { professionalID: new mongoose.Types.ObjectId(professionalID) } }, // Use 'new' here
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;

    res.status(200).json({ success: true, data: { professionalID, averageRating } });
  } catch (error) {
    console.error('Error in getAverageRating:', error.message); // Log the error message
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};