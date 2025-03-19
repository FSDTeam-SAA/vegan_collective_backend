const mongoose = require("mongoose");
const Professionalinfo = require("../models/professionalInfo.model");
const Review = require('../models/professionalReview.model');
const User = require("../models/user.model");
const upload = require("../utils/multerConfig");

/**
 * Create a new professional info entry with profile photo upload
 */
exports.createProfessionalInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      let { userID, fullName, designation, businessName, address, about, highlightedStatement, experience, certifications, websiteURL, governmentIssuedID, professionalCertification, photoWithID, isVerified } = req.body;

      console.log("Received userID:", userID);

      // ✅ Validate userID format
      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ success: false, message: "Invalid userID format" });
      }

      // ✅ Ensure userID exists in the database
      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "User does not exist" });
      }

      // ✅ Check if professional info already exists
      const existingProfessionalInfo = await Professionalinfo.findOne({ userId: userID });
      if (existingProfessionalInfo) {
        return res.status(400).json({
          success: false,
          message: "Professional info already exists for this user",
        });
      }

      // ✅ Parse highlightedStatement safely
      let parsedHighlightedStatement = [];
      if (highlightedStatement) {
        try {
          parsedHighlightedStatement = JSON.parse(highlightedStatement);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for highlightedStatement",
          });
        }
      }

      // ✅ Parse experience field into an array
      let parsedExperience = [];
      if (experience) {
        try {
          // If experience is a JSON string, parse it
          parsedExperience = JSON.parse(experience);
        } catch (parseError) {
          // If it's not JSON, split by commas to create an array
          parsedExperience = experience.split(",").map((item) => item.trim());
        }
      }


         let parsedCertifications = []
         if (experience) {
           try {
             // If experience is a JSON string, parse it
             parsedCertifications = JSON.parse(certifications)
           } catch (parseError) {
             // If it's not JSON, split by commas to create an array
             parsedCertifications = certifications
               .split(',')
               .map((item) => item.trim())
           }
         }

    

      const profilePhotoUrl = req.file ? req.file.path : null;

      // ✅ Use correct `userId` field name
      const newProfessionalInfo = new Professionalinfo({
        userId: userID, // ✅ FIXED: Correct field name
        fullName,
        profilePhoto: profilePhotoUrl,
        designation,
        businessName,
        address,
        about,
        highlightedStatement: parsedHighlightedStatement,
        experience: parsedExperience,
        certifications: parsedCertifications,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      })

      const savedProfessionalInfo = await newProfessionalInfo.save();

      res.status(201).json({
        success: true,
        message: "Professional info created successfully",
        data: savedProfessionalInfo,
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating professional info",
      error: error.message,
    });
  }
};


/**
 * Get all professional info with filtering, pagination, and sorting
 */
// exports.getAllProfessionalInfo = async (req, res) => {
//   try {
//     // Extract query parameters for filtering
//     const { fullName, designation, address } = req.query;

//     // Extract query parameters for pagination
//     const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided

//     // Extract query parameters for sorting
//     const sortBy = req.query.sortBy || "createdAt"; // Default to sorting by createdAt
//     const order = req.query.order === "asc" ? 1 : -1; // Default to descending order

//     // Build the filter object based on query parameters
//     const filter = {};
//     if (fullName) filter.fullName = { $regex: fullName, $options: "i" }; // Case-insensitive search
//     if (designation) filter.designation = { $regex: designation, $options: "i" }; // Case-insensitive search
//     if (address) filter.address = { $regex: address, $options: "i" }; // Case-insensitive search

//     // Calculate skip value for pagination
//     const skip = (page - 1) * limit;

//     // Fetch professional info entries with filtering, pagination, and sorting
//     const professionalInfoList = await Professionalinfo.find(filter)
//       .sort({ [sortBy]: order }) // Dynamic sorting
//       .skip(skip)
//       .limit(limit);

//     // Count total number of documents matching the filter
//     const totalItems = await Professionalinfo.countDocuments(filter);

//     // Calculate total pages
//     const totalPages = Math.ceil(totalItems / limit);

//     // Prepare pagination metadata
//     const pagination = {
//       currentPage: page,
//       totalPages,
//       totalItems,
//       itemsPerPage: limit,
//     };

//     // Return the list of professional info entries with pagination metadata
//     res.status(200).json({
//       success: true,
//       message: "Professional info entries retrieved successfully",
//       data: professionalInfoList,
//       pagination,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving professional info",
//       error: error.message,
//     });
//   }
// };

// exports.getAllProfessionalInfo = async (req, res) => {
//   try {
//     // Extract query parameters for filtering
//     const { fullName, designation, address } = req.query;

//     // Extract query parameters for pagination
//     const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided

//     // Extract query parameters for sorting
//     const sortBy = req.query.sortBy || "createdAt"; // Default to sorting by createdAt
//     const order = req.query.order === "asc" ? 1 : -1; // Default to descending order

//     // Build the filter object based on query parameters
//     const filter = {};
//     if (fullName) filter.fullName = { $regex: fullName, $options: "i" }; // Case-insensitive search
//     if (designation) filter.designation = { $regex: designation, $options: "i" }; // Case-insensitive search
//     if (address) filter.address = { $regex: address, $options: "i" }; // Case-insensitive search

//     // Calculate skip value for pagination
//     const skip = (page - 1) * limit;

//     // Fetch professional info entries with filtering, pagination, and sorting
//     const professionalInfoList = await Professionalinfo.find(filter)
//       .sort({ [sortBy]: order }) // Dynamic sorting
//       .skip(skip)
//       .limit(limit);

//     // Count total number of documents matching the filter
//     const totalItems = await Professionalinfo.countDocuments(filter);

//     // Calculate total pages
//     const totalPages = Math.ceil(totalItems / limit);

//     // Get the user IDs of the professionals
//     const professionalIds = professionalInfoList.map((prof) => prof.userId);

//     // Fetch reviews for these professionals
//     const reviews = await Review.find({ professionalID: { $in: professionalIds } });

//     // Create a map of professionalID to reviews
//     const reviewMap = reviews.reduce((acc, review) => {
//       if (!acc[review.professionalID]) {
//         acc[review.professionalID] = {
//           totalReviews: 0,
//           reviews: [],
//         };
//       }
//       acc[review.professionalID].totalReviews += 1;
//       acc[review.professionalID].reviews.push(review);
//       return acc;
//     }, {});

//     // Add reviews to each professional info entry
//     const professionalInfoWithReviews = professionalInfoList.map((prof) => ({
//       ...prof.toObject(),
//       totalReviews: reviewMap[prof.userId.toString()]?.totalReviews || 0,
//       reviews: reviewMap[prof.userId.toString()]?.reviews || [],
//     }));

//     // Prepare pagination metadata
//     const pagination = {
//       currentPage: page,
//       totalPages,
//       totalItems,
//       itemsPerPage: limit,
//     };

//     // Return the list of professional info entries with pagination metadata
//     res.status(200).json({
//       success: true,
//       message: "Professional info entries retrieved successfully",
//       data: professionalInfoWithReviews,
//       pagination,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving professional info",
//       error: error.message,
//     });
//   }
// };

/**
 * Get professional info by user ID
 */


exports.getAllProfessionalInfo = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { fullName, designation, address } = req.query;

    // Extract query parameters for pagination
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided

    // Extract query parameters for sorting
    const sortBy = req.query.sortBy || "createdAt"; // Default to sorting by createdAt
    const order = req.query.order === "asc" ? 1 : -1; // Default to descending order

    // Build the filter object based on query parameters
    const filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" }; // Case-insensitive search
    if (designation) filter.designation = { $regex: designation, $options: "i" }; // Case-insensitive search
    if (address) filter.address = { $regex: address, $options: "i" }; // Case-insensitive search

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch professional info entries with filtering, pagination, and sorting
    const professionalInfoList = await Professionalinfo.find(filter)
      .sort({ [sortBy]: order }) // Dynamic sorting
      .skip(skip)
      .limit(limit);

    // Count total number of documents matching the filter
    const totalItems = await Professionalinfo.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Get the user IDs of the professionals
    const professionalIds = professionalInfoList.map((prof) => prof.userId);

    // Fetch total reviews and average rating for these professionals
    const reviewStats = await Review.aggregate([
      {
        $match: { professionalID: { $in: professionalIds } }, // Match reviews for the fetched professionals
      },
      {
        $group: {
          _id: "$professionalID", // Group by professionalID
          totalReviews: { $sum: 1 }, // Count the number of reviews
          averageRating: { $avg: "$rating" }, // Calculate the average rating
        },
      },
    ]);

    // Create a map of professionalID to review stats
    const reviewStatsMap = reviewStats.reduce((acc, curr) => {
      acc[curr._id.toString()] = {
        totalReviews: curr.totalReviews,
        averageRating: curr.averageRating.toFixed(1), // Round to 1 decimal place
      };
      return acc;
    }, {});

    // Add totalReviews and averageRating to each professional info entry
    const professionalInfoWithStats = professionalInfoList.map((prof) => ({
      ...prof.toObject(),
      totalReviews: reviewStatsMap[prof.userId.toString()]?.totalReviews || 0, // Default to 0 if no reviews exist
      averageRating: reviewStatsMap[prof.userId.toString()]?.averageRating || 0, // Default to 0 if no reviews exist
    }));

    // Prepare pagination metadata
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    };

    // Return the list of professional info entries with pagination metadata
    res.status(200).json({
      success: true,
      message: "Professional info entries retrieved successfully",
      data: professionalInfoWithStats,
      pagination,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};
exports.getProfessionalInfoByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Validate userID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userID format",
      });
    }

    // ✅ Find professional info by userId
    const professionalInfo = await Professionalinfo.findOne({ userId: userId });

    // ✅ Check if professional info exists
    if (!professionalInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found for this user",
      });
    }

    // ✅ Return the professional info
    res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfo,
    });
  } catch (error) {
    console.error("Error retrieving professional info:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};

// Update professional info by ID
exports.updateProfessionalInfo = [
  upload.single("profilePhoto"), // Multer middleware for file upload
  
  async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid professional info ID format",
        });
      }

      console.log("Incoming request body:", req.body);
      console.log("Uploaded file:", req.file);

      // ✅ Prepare update data
      const updateData = { userID, fullName, designation, businessName, address, about, highlightedStatement, experience, certifications, websiteURL, governmentIssuedID, professionalCertification, photoWithID, isVerified,phoneNumber } = req.body;

      // ✅ Handle profile photo upload (if provided)
      if (req.file) {
        updateData.profilePhoto = req.file.path; // Use Cloudinary URL instead of buffer
      }

      // ✅ Function to safely parse JSON fields
      const parseJSONField = (field) => {
        try {
          return JSON.parse(field);
        } catch {
          return field; // Keep original value if parsing fails
        }
      };

      // ✅ Handle JSON fields safely
      if (updateData.highlightedStatement) {
        updateData.highlightedStatement = parseJSONField(updateData.highlightedStatement);
      }
      if (updateData.experience) {
        updateData.experience = parseJSONField(updateData.experience);
      }

         if (updateData.certifications) {
           updateData.certifications = parseJSONField(updateData.certifications)
         }




      // ✅ Update the professional info
      const updatedInfo = await Professionalinfo.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedInfo) {
        return res.status(404).json({
          success: false,
          message: "Professional info not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Professional info updated successfully",
        data: updatedInfo,
      });
    } catch (error) {
      console.error("Error updating professional info:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating professional info",
        error: error.message,
      });
    }
  },
];


/**
 * Delete professional info by ID
 */
exports.deleteProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Professionalinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res.status(404).json({ success: false, message: "Professional info not found" });
    }
    return res.status(200).json({ success: true, message: "Professional info deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting professional info", error: error.message });
  }
};