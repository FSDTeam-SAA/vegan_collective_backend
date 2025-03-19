const Review = require('../models/professionalReview.model'); // Import the Review model
const Professionalinfo = require('../models/professionalInfo.model'); // Import the Professional model
const mongoose = require('mongoose');


// Controller to add a review
exports.addReview = async (req, res) => {
  try {
    const { userID, professionalID, rating, comment } = req.body;

    // Validate required fields
    if (!userID || !professionalID || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields (userID, professionalID, rating) are required.",
      });
    }

    // Check if the user has already reviewed the professional
    const existingReview = await Review.findOne({ userID, professionalID });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this professional.",
      });
    }

    // Create a new review
    const newReview = new Review({ userID, professionalID, rating, comment });
    await newReview.save();

    // Calculate the average rating for the professional
    const reviews = await Review.find({ professionalID });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2);

    // Return response with the desired structure
    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: [
        {
          ...newReview.toObject(), // Spread the review object
          averageRating, // Add the averageRating to the same object
        },
      ],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding review.",
    });
  }
};


//get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews
    const reviews = await Review.find();

    // Calculate total reviews for each professional
    const professionalReviews = reviews.reduce((acc, review) => {
      if (!acc[review.professionalID]) {
        acc[review.professionalID] = {
          totalReviews: 0,
          reviews: [],
        };
      }
      acc[review.professionalID].totalReviews += 1;
      acc[review.professionalID].reviews.push(review);
      return acc;
    }, {});

    // Format the response
    const response = Object.keys(professionalReviews).map((professionalID) => {
      return {
        professionalID,
        totalReviews: professionalReviews[professionalID].totalReviews,
        reviews: professionalReviews[professionalID].reviews,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching reviews.",
    });
  }
};


//get all reviews of a professional ID with pagination and filtering by Highest rating, lowest rating and most relevant , most recent
exports.getReviewsOfProfessional = async (req, res) => {
  try {
    const { professionalID } = req.params;
    const { page = 1, limit = 10, sort = 'desc', filter = 'highest' } = req.query;

    let query = { professionalID };
    let sortObj = {};

    // Define sorting logic based on the filter
    if (filter === 'highest') {
      sortObj = { rating: -1 };
    } else if (filter === 'lowest') {
      sortObj = { rating: 1 };
    } else if (filter === 'mostRecent') {
      sortObj = { createdAt: -1 };
    } else if (filter === 'mostRelevant') {
      // Custom logic for most relevant reviews
      sortObj = { rating: -1, createdAt: -1 };
    }

    // Fetch reviews with pagination and sorting
    const reviews = await Review.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userID', 'fullName'); // Populate user details

    // Calculate total reviews for the professional
    const totalReviews = await Review.countDocuments(query);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalReviews / limit);

    // Pagination metadata
    const pagination = {
      currentPage: Number(page),
      totalPages: totalPages,
      totalItems: totalReviews,
      itemsPerPage: Number(limit),
    };

    // Return response with reviews, pagination, and total reviews
    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      data: {
        totalReviews, // Add total reviews for the professional
        reviews: reviews.map(review => ({
          ...review.toObject(),
          userID: review.userID._id,
          fullName: review.userID.fullName,
        })),
      },
      pagination,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching reviews.",
    });
  }
};







exports.getTopProfessionals = async (req, res) => {
/*************  ✨ Codeium Command ⭐  *************/
/**
 * Retrieves reviews for a specific professional with pagination and sorting options.
 * 
 * @param {Object} req - The request object containing parameters and query.
 * @param {Object} req.params - The parameters object.
 * @param {string} req.params.professionalID - The ID of the professional whose reviews are to be fetched.
 * @param {Object} req.query - The query object containing pagination and sorting information.
 * @param {number} [req.query.page=1] - The page number for pagination.
 * @param {number} [req.query.limit=10] - The number of reviews per page.
 * @param {string} [req.query.sort='desc'] - The sort order for reviews based on creation date ("asc" or "desc").
 * @param {string} [req.query.filter='highest'] - The filter criteria (currently not used in logic).
 * 
 * @param {Object} res - The response object used to send back the desired HTTP response.
 * 
 * @returns {void} Responds with a JSON object containing success status, message, and list of reviews.
 * On error, responds with a JSON object containing success status and error message.
 */

/******  5459dc2b-5525-4fce-97c9-395a6fc6383c  *******/  try {
    // Get the rating filter from query params
    const ratingFilter = parseFloat(req.query.ratting);
    
    // Define min and max rating for filtering
    let minRating = 0;
    let maxRating = 5;
    
    // If rating filter is provided, set the range (e.g., for 4, range is 3.1-4.0)
    if (!isNaN(ratingFilter)) {
      maxRating = ratingFilter;
      minRating = maxRating - 0.9; // For range like 3.1 to 4.0
    }

    // Step 1: Aggregate reviews to calculate average ratings and total reviews
    const professionalsWithRatings = await Review.aggregate([
      {
        $group: {
          _id: "$professionalID", // Group reviews by professionalID
          averageRating: { $avg: "$rating" }, // Calculate average rating
          totalReviews: { $sum: 1 }, // Count total reviews for each professional
        },
      },
      { 
        $match: { 
          averageRating: { 
            $gte: minRating, 
            $lte: maxRating 
          } 
        } 
      },
      { $sort: { averageRating: -1 } }, // Sort by rating descending
    ]);

    // Step 2: Extract professional IDs (which are actually userId values)
    const professionalUserIDs = professionalsWithRatings.map(prof => new mongoose.Types.ObjectId(prof._id));

    // Step 3: Fetch professional details using userId instead of _id
    const professionals = await Professionalinfo.find(
      { userId: { $in: professionalUserIDs } }, // Match userId, not _id
      "userId profilePhoto businessName about address"
    ).lean();

    // Step 4: Combine review data with professional details
    const result = professionalsWithRatings.map(professionalWithRating => {
      const professionalInfo = professionals.find(
        pro => pro.userId.toString() === professionalWithRating._id.toString()
      );

      return {
        professionalID: professionalWithRating._id,
        businessName: professionalInfo?.businessName || "Not Found",
        about: professionalInfo?.about || "Not Found",
        profilePhoto: professionalInfo?.profilePhoto || "Not Found",
        address: professionalInfo?.address || "Not Found",
        averageRating: professionalWithRating.averageRating.toFixed(2),
        totalReviews: professionalWithRating.totalReviews,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Top professionals fetched successfully.",
      data: result,
      // filterApplied: ratingFilter ? `${minRating.toFixed(1)} to ${maxRating.toFixed(1)}` : "None"
    });
  } catch (error) {
    console.error("Error fetching top professionals:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching top professionals.",
      error: error.message
    });
  }
};

