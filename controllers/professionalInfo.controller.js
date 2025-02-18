const mongoose = require("mongoose");
const Professionalinfo = require("../models/professionalInfo.model");
const User = require("../models/user.model");

// Create a new professional info
exports.createProfessionalInfo = async (req, res) => {
  try {
    const { userID } = req.body;
    // Validate if userID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userID format",
      });
    }
    // Check if the user exists and has an account type of "professional"
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.accountType !== "professional") {
      return res.status(403).json({
        success: false,
        message: "This user is not a professional",
      });
    }
    // Create the professional info entry
    const professionalInfo = new Professionalinfo(req.body);
    const savedInfo = await professionalInfo.save();
    res.status(201).json({
      success: true,
      message: "Professional info created successfully",
      data: savedInfo,
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

// Update professional info by ID
exports.updateProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = await Professionalinfo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
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
  } catch (error) {
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