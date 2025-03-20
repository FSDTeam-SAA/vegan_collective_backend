const MerchantProductsReview = require("../models/merchantProductsReview.model");
const MerchantProducts = require("../models/merchantProducts.model");
const mongoose = require("mongoose"); 

// Create a review
exports.createReview = async (req, res) => {
  const { merchantID, userID, productID, rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  try {
    const existingReview = await MerchantProductsReview.findOne({ userID, productID });

    if (existingReview) {
      return res.status(400).json({ success: false, message: "User can only submit one review per product" });
    }

    const review = new MerchantProductsReview({ merchantID, userID, productID, rating, comment });

    await review.save();
    res.status(201).json({ success: true, message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get all reviews for a specific product and show the average rating
exports.getByProductID = async (req, res) => {
  try {
    const { productID } = req.params;
    const reviews = await MerchantProductsReview.find({ productID });

    // Calculate the average rating
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({ success: true, message: "Reviews fetched successfully", reviews, averageRating: avgRating.toFixed(2) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get all reviews for a specific merchant
exports.getByMerchantID = async (req, res) => {
  try {
    const { merchantID } = req.params;
    const { page = 1, limit = 10, sortByRating } = req.query; // Default page = 1, limit = 10

    if (!mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ success: false, message: "Invalid merchantID" });
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Build the query
    let query = MerchantProductsReview.find({ merchantID })
      .populate("productID", "productName")
      .populate("userID", "fullName")
      .skip(skip)
      .limit(limitNumber);

    // Add sorting based on rating
    if (sortByRating === "highest") {
      query = query.sort({ rating: -1 }); // Sort by highest rating
    } else if (sortByRating === "lowest") {
      query = query.sort({ rating: 1 }); // Sort by lowest rating
    }

    const reviews = await query.lean();

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: "No reviews found for this merchant" });
    }

    // Get the total number of reviews for pagination
    const totalItems = await MerchantProductsReview.countDocuments({ merchantID });
    const totalPages = Math.ceil(totalItems / limitNumber);

    const reviewData = reviews.map((review) => ({
      _id: review._id,
      productID: review.productID ? review.productID._id : null,
      productName: review.productID ? review.productID.productName : "",
      rating: review.rating,
      comment: review.comment,
      userID: review.userID ? review.userID._id : null,
      fullName: review.userID ? review.userID.fullName : "",
    }));

    // Pagination metadata
    const pagination = {
      currentPage: pageNumber,
      totalPages,
      totalItems,
      itemsPerPage: limitNumber,
    };

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      reviews: reviewData,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const updatedReview = await MerchantProductsReview.findByIdAndUpdate(
      reviewID,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review updated successfully", updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewID } = req.params;

    const deletedReview = await MerchantProductsReview.findByIdAndDelete(reviewID);

    if (!deletedReview) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};





