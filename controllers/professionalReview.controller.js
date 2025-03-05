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

// Controller to update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewID } = req.params;
    const { rating, comment } = req.body;

    // Validate required fields
    if (!reviewID) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // Find the review by ID
    const review = await Review.findById(reviewID);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Update the review fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    // Save the updated review
    await review.save();

    // Recalculate the average rating for the professional
    const reviews = await Review.find({ professionalID: review.professionalID });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2);

    // Return the response in the desired structure
    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: [
        {
          ...review.toObject(), // Spread the updated review object
          averageRating, // Add the recalculated average rating
        },
      ],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating review.",
    });
  }
};

// Controller to get the average rating of a professional
exports.getAverageRating = async (req, res) => {
  try {
    const { professionalID } = req.params;

    // Validate professionalID
    if (!professionalID) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required.",
      });
    }

    // Fetch all reviews for the professional
    const reviews = await Review.find({ professionalID });

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this professional.",
      });
    }

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2);

    return res.status(200).json({
      success: true,
      message: "Average rating fetched successfully.",
      data: {
        professionalID,
        averageRating,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching average rating.",
    });
  }
};

// Controller to get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews from the database and populate related fields
    const reviews = await Review.find()
      .select('rating comment professionalID') // Select only the required fields
      .populate('userID', 'name email') // Populate user details if needed
      // .populate('professionalID', 'name'); // Populate professional details

    // If no reviews are found, return a 404 response
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found.",
      });
    }

    // Return the reviews as an array of objects with the desired structure
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully.",
      data: reviews.map(review => ({
        professionalID: review.professionalID?._id || null, // Include professionalID (_id)
        // professionalName: review.professionalID?.name || null, // Include professional name
        rating: review.rating,
        comment: review.comment,
      })), // Format the response to include only the required fields
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching reviews.",
    });
  }
};



// Controller to get top professionals based on average ratings
exports.getTopProfessionals = async (req, res) => {
  try {
    // Step 1: Aggregate reviews to calculate average ratings and total reviews
    const professionalsWithRatings = await Review.aggregate([
      {
        $group: {
          _id: "$professionalID", // Group reviews by professionalID
          averageRating: { $avg: "$rating" }, // Calculate average rating
          totalReviews: { $sum: 1 }, // Count total reviews for each professional
        },
      },
      { $sort: { averageRating: -1 } }, // Sort by rating descending
    ]);

    // Step 2: Extract professional IDs (which are actually userId values)
    const professionalUserIDs = professionalsWithRatings.map(prof => new mongoose.Types.ObjectId(prof._id));

    // console.log("Extracted Professional User IDs:", professionalUserIDs);

    // Step 3: Fetch professional details using userId instead of _id
    const professionals = await Professionalinfo.find(
      { userId: { $in: professionalUserIDs } }, // Match userId, not _id
      "userId businessName about address"
    ).lean();

    // console.log("Fetched Professional Data:", professionals);

    // Step 4: Combine review data with professional details
    const result = professionalsWithRatings.map(professionalWithRating => {
      const professionalInfo = professionals.find(
        pro => pro.userId.toString() === professionalWithRating._id.toString()
      );

      return {
        professionalID: professionalWithRating._id,
        businessName: professionalInfo?.businessName || "Not Found",
        about: professionalInfo?.about || "Not Found",
        address: professionalInfo?.address || "Not Found",
        averageRating: professionalWithRating.averageRating.toFixed(2),
        totalReviews: professionalWithRating.totalReviews,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Top professionals fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching top professionals:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching top professionals.",
    });
  }
};

// exports.getTopProfessionals = async (req, res) => {
//   try {
//     // Step 1: Aggregate reviews to calculate average ratings and total reviews
//     const professionalsWithRatings = await Review.aggregate([
//       {
//         $group: {
//           _id: "$professionalID", // Group reviews by professionalID
//           averageRating: { $avg: "$rating" }, // Calculate average rating
//           totalReviews: { $sum: 1 }, // Count total reviews for each professional
//         },
//       },
//       {
//         $sort: { averageRating: -1 }, // Sort by averageRating in descending order
//       },
//     ]);

//     // Log the aggregation result
//     console.log("Professionals with ratings:", professionalsWithRatings);

//     // Step 2: Extract professional IDs from the aggregation result
//     const professionalIDs = professionalsWithRatings.map(professional => professional._id);

//     // Log the extracted professional IDs
//     console.log("Professional IDs from reviews:", professionalIDs);

//     // Step 3: Fetch professional details using the IDs
//     const professionals = await Professionalinfo.find(
//       { _id: { $in: professionalIDs } }, // Find professionals whose IDs are in the list
//       'businessName about address' // Select only the required fields
//     );

//     // Log the professionals fetched from Professionalinfo
//     console.log("Professionals fetched from Professionalinfo:", professionals);

//     // Step 4: Combine review data with professional details
//     const result = professionalsWithRatings.map(professionalWithRating => {
//       const professionalInfo = professionals.find(
//         professional => professional._id.toString() === professionalWithRating._id.toString()
//       );

//       // Log the matching professional info
//       console.log("Matching professional info for ID:", professionalWithRating._id, professionalInfo);

//       return {
//         professionalID: professionalWithRating._id,
//         businessName: professionalInfo?.businessName || null,
//         about: professionalInfo?.about || null,
//         address: professionalInfo?.address || null,
//         averageRating: professionalWithRating.averageRating.toFixed(2), // Format to 2 decimal places
//         totalReviews: professionalWithRating.totalReviews,
//       };
//     });

//     // Step 5: Return the combined data
//     return res.status(200).json({
//       success: true,
//       message: "Top professionals fetched successfully.",
//       data: result,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching top professionals.",
//     });
//   }
// };