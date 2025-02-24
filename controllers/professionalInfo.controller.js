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
        experience,
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
    const { page = 1, limit = 6, sortBy = "fullName", order = "asc", fullName, designation, address } = req.query;

    // Build filters
    const filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (designation) filter.designation = { $regex: designation, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    // Sorting and pagination
    const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionalInfoList = await Professionalinfo.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalDocuments = await Professionalinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfoList,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalDocuments,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving professional info", error: error.message });
  }
};

/**
 * Get a single professional info entry by ID
 */
exports.getProfessionalInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalInfo = await Professionalinfo.findById(id);
    if (!professionalInfo) {
      return res.status(404).json({ success: false, message: "Professional info not found" });
    }
    return res.status(200).json({ success: true, message: "Professional info retrieved successfully", data: professionalInfo });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving professional info", error: error.message });
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
      const updateData = { ...req.body };

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
