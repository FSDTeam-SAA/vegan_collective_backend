const MerchantProductsReview = require("../models/merchantProductsReview.model");
const MerchantProducts = require("../models/merchantProducts.model");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { merchantID, userID, productID, rating, comment } = req.body;

    // Ensure rating is between 0 and 5
    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    // Create a new review
    const review = new MerchantProductsReview({
      merchantID,
      userID,
      productID,
      rating,
      comment,
    });
    await review.save();

    // Calculate and update the new average rating
    await updateProductAverageRating(productID);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get all reviews for a specific product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productID } = req.params;
    const reviews = await MerchantProductsReview.find({ productID }).populate(
      "userID",
      "name"
    );

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get average rating for a specific product
exports.getAverageRating = async (req, res) => {
  try {
    const { productID } = req.params;
    const reviews = await MerchantProductsReview.find({ productID });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
      });
    }

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    res.status(200).json({
      success: true,
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

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const { merchantID, userID, productID, rating, comment } = req.body;

    // Ensure rating is between 0 and 5
    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    // Find and update the review
    const review = await MerchantProductsReview.findByIdAndUpdate(
      reviewID,
      { merchantID, userID, productID, rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Calculate and update the new average rating
    await updateProductAverageRating(review.productID);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewID } = req.params;

    // Find and delete the review
    const review = await MerchantProductsReview.findByIdAndDelete(reviewID);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Calculate and update the new average rating
    await updateProductAverageRating(review.productID);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get top merchant products sorted by average rating
exports.getTopMerchantProducts = async (req, res) => {
  try {
    // Fetch all products with their average ratings
    const products = await MerchantProducts.find({}).lean();

    // Calculate average rating for each product
    const productsWithAvgRating = await Promise.all(
      products.map(async (product) => {
        const reviews = await MerchantProductsReview.find({
          productID: product._id,
        });
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return {
          ...product,
          avgRating: avgRating.toFixed(2),
        };
      })
    );

    // Filter out products with an average rating of 0.00
    const filteredProducts = productsWithAvgRating.filter(
      (product) => parseFloat(product.avgRating) > 0
    );

    // Sort products by average rating in descending order
    const sortedProducts = filteredProducts.sort(
      (a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating)
    );

    // Format the response
    const response = sortedProducts.map((product) => ({
      merchantID: product.merchantID,
      productID: product._id,
      productName: product.productName,
      productImage: product.productImage,
      description: product.description,
      metaDescription: product.metaDescription,
      price: product.price,
      avgRating: product.avgRating,
    }));

    res.status(200).json({
      success: true,
      message: "Top merchant products fetched successfully",
      products: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Helper function to update the product's average rating
async function updateProductAverageRating(productID) {
  const reviews = await MerchantProductsReview.find({ productID });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  await MerchantProducts.findByIdAndUpdate(productID, {
    avgRating: avgRating.toFixed(2),
  });
}

