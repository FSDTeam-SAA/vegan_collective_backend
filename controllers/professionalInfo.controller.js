const mongoose = require("mongoose");
const Professionalinfo = require("../models/professionalInfo.model");
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
        certifications,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      });

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
      data: professionalInfoList,
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
/**
 * Get a single professional info entry by professionalId
 */
exports.getProfessionalInfoByProfessionalId = async (req, res) => {
  try {
    const { professionalId } = req.params; // Extract professionalId from request params

    // Query the database using the professionalId field
    const professionalInfo = await Professionalinfo.findOne({ professionalId });

    // If no matching document is found, return a 404 response
    if (!professionalInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional ID not found in the database",
      });
    }

    // Return the professional info if found
    return res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfo,
    });
  } catch (error) {
    console.error("Error retrieving professional info:", error);
    return res.status(500).json({
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