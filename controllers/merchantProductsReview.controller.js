const MerchantProductsReview = require("../models/merchantProductsReview.model");
const MerchantProducts = require("../models/merchantProducts.model");
const mongoose = require("mongoose"); 

// Create a review
exports.createReview = async (req, res) => {
  const { merchantID, userID, productID, rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const existingReview = await MerchantProductsReview.findOne({
      userID,
      productID,
    });

    if (existingReview) {
      return res.status(400).json({ error: "User can only submit one review per product" });
    }

    const review = new MerchantProductsReview({
      merchantID,
      userID,
      productID,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews for a specific product and show the avarage rating
exports.getByProductID = async (req, res) => {
  try {
    const { productID } = req.params;
    const reviews = await MerchantProductsReview.find({ productID });

    // Calculate the average rating
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: avgRating.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get all reviews for a specific merchant

exports.getByMerchantID = async (req, res) => {
  try {
    const { merchantID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ success: false, message: "Invalid merchantID" });
    }

    // Fetch reviews, including those with null productID
    const reviews = await MerchantProductsReview.find({ merchantID })
      .populate("productID", "productName")
      .populate("userID", "fullName") // Fetch user fullName
      .lean();

    console.log("All Reviews:", reviews);

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: "No reviews found for this merchant" });
    }

    const reviewData = reviews.map((review) => ({
      _id: review._id,
      productID: review.productID ? review.productID._id : null,
      productName: review.productID ? review.productID.productName : "",
      rating: review.rating,
      comment: review.comment,
  
        userID: review.userID ? review.userID._id : null,
        fullName: review.userID ? review.userID.fullName : "",
        //userImage: review.userID ? review.userID.image : "",

    }));

    res.status(200).json({ success: true, reviews: reviewData });
  } catch (error) {
    console.error("Error in getByMerchantID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const updatedReview = await MerchantProductsReview.findByIdAndUpdate(
      reviewID,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
}

//Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewID } = req.params;

    const deletedReview = await MerchantProductsReview.findByIdAndDelete(reviewID);

    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found" });
    } 
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}






