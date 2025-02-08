const Review = require('../models/review.model');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { user, rating, comment } = req.body;

        // Validate required fields
        if (!user || !rating) {
            return res.status(400).json({ status: false, message: "User ID and rating are required." });
        }

        const review = new Review({
            user,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ status: true, message: "Review created successfully.", review });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error creating review.", error: error.message });
    }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('user', 'username email'); // Populate user details
        res.status(200).json({ status: true, reviews });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error fetching reviews.", error: error.message });
    }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('user', 'username email');
        if (!review) {
            return res.status(404).json({ status: false, message: "Review not found." });
        }
        res.status(200).json({ status: true, review });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error fetching review.", error: error.message });
    }
};

// Update a review by ID
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, comment },
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({ status: false, message: "Review not found." });
        }
        res.status(200).json({ status: true, message: "Review updated successfully.", review });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error updating review.", error: error.message });
    }
};

// Delete a review by ID
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ status: false, message: "Review not found." });
        }
        res.status(200).json({ status: true, message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error deleting review.", error: error.message });
    }
};