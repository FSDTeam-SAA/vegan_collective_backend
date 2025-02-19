const mongoose = require("mongoose");
const Professionalinfo = require("../models/professionalInfo.model");
const User = require("../models/user.model");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_photos", // Folder name in Cloudinary
    allowedFormats: ["jpg", "jpeg", "png"], // Allowed file formats
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique filename
  },
});

const upload = multer({ storage });

// Create a new professional info with profile photo upload to Cloudinary
exports.createProfessionalInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      const {
        userID,
        fullName,
        designation,
        businessName,
        address,
        about,
        highlightedStatement,
        experience,
        certifications,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
      } = req.body;

      // Parse highlightedStatement if it's a string
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

      // Validate if the user exists
      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(400).json({ error: "Invalid userID. User does not exist." });
      }

      // Check if the user already has professional info
      const existingProfessionalInfo = await Professionalinfo.findOne({ userID });
      if (existingProfessionalInfo) {
        return res.status(400).json({
          success: false,
          message: "Professional info already exists for this user",
        });
      }

      // Get profile photo URL from Cloudinary
      const profilePhotoUrl = req.file ? req.file.path : null;

      // Create a new professional info entry
      const newProfessionalInfo = new Professionalinfo({
        userID,
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
      });

      // Save the professional info to the database
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

// Get all professional info with filtering, pagination, and sorting
exports.getAllProfessionalInfo = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit = 6, 
      sortBy = "fullName", 
      order = "asc", 
      fullName, 
      designation, 
      address 
    } = req.query;

    // Build the filter object based on query parameters
    const filter = {};

    // Validate fullName against the database
    if (fullName) {
      const isValidFullName = await Professionalinfo.exists({ fullName: { $regex: fullName, $options: "i" } });
      if (!isValidFullName) {
        return res.status(400).json({
          success: false,
          message: "Invalid fullName. No matching records found.",
          data: [],
        });
      }
      filter.fullName = { $regex: fullName, $options: "i" }; // Case-insensitive search
    }

    // Add other filters
    if (designation) filter.designation = { $regex: designation, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    // Sorting logic
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query the database
    const professionalInfoList = await Professionalinfo.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total documents for pagination metadata
    const totalDocuments = await Professionalinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    // Fallback: If no data is found, return all professional info without filters
    if (professionalInfoList.length === 0 && Object.keys(filter).length > 0) {
      const allProfessionalInfo = await Professionalinfo.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const totalAllDocuments = await Professionalinfo.countDocuments();
      const totalAllPages = Math.ceil(totalAllDocuments / parseInt(limit));

      return res.status(200).json({
        success: true,
        message: " Showing all professional info.",
        data: allProfessionalInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalAllPages,
          totalItems: totalAllDocuments,
          itemsPerPage: parseInt(limit),
        },
      });
    }

    // Send response
    res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfoList,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: totalDocuments,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};
// Get a single professional info by ID
exports.getProfessionalInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalInfo = await Professionalinfo.findById(id);
    if (!professionalInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};

// Update professional info by ID (Handles form-data)
exports.updateProfessionalInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading profile photo",
        });
      }
      const { id } = req.params;

      // Validate if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid professional info ID format",
        });
      }

      // Prepare the update object
      const updateData = { ...req.body }; // Copy all text fields from req.body

      // Parse highlightedStatement if it's a string
      if (updateData.highlightedStatement) {
        try {
          updateData.highlightedStatement = JSON.parse(updateData.highlightedStatement);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for highlightedStatement",
          });
        }
      }

      // Add profile photo path if a new file was uploaded
      if (req.file) {
        updateData.profilePhoto = req.file.path; // Save the file path to the database
      }

      // Update the professional info entry
      const updatedInfo = await Professionalinfo.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validations
        }
      );

      if (!updatedInfo) {
        return res.status(404).json({
          success: false,
          message: "Professional info not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Professional info updated successfully",
        data: updatedInfo,
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating professional info",
      error: error.message,
    });
  }
};
// Delete professional info by ID
exports.deleteProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Professionalinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Professional info deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting professional info",
      error: error.message,
    });
  }
};