const mongoose = require("mongoose");
const Merchantinfo = require("../models/merchantInfo.model");
const User = require("../models/user.model");
const upload = require("../utils/multerConfig");

/**
 * Create a new merchant info entry with profile photo upload
 */
exports.createMerchantInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      let { userID, fullName, businessName, address, about, shortDescriptionOfStore, businessHours, highlightedStatement, websiteURL, governmentIssuedID, professionalCertification, photoWithID, isVerified } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ success: false, message: "Invalid userID format" });
      }

      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "User does not exist" });
      }

      const existingMerchantInfo = await Merchantinfo.findOne({ userID });
      if (existingMerchantInfo) {
        return res.status(400).json({ success: false, message: "Merchant info already exists for this user" });
      }

      let parsedBusinessHours = [];
      let parsedHighlightedStatement = [];
      
      try {
        if (businessHours) parsedBusinessHours = JSON.parse(businessHours);
        if (highlightedStatement) parsedHighlightedStatement = JSON.parse(highlightedStatement);
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for businessHours or highlightedStatement" });
      }

      const profilePhotoUrl = req.file ? req.file.path : null;

      const newMerchantInfo = new Merchantinfo({
        userID,
        profilePhoto: profilePhotoUrl,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours: parsedBusinessHours,
        highlightedStatement: parsedHighlightedStatement,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      });

      const savedMerchantInfo = await newMerchantInfo.save();
      res.status(201).json({ success: true, message: "Merchant info created successfully", data: savedMerchantInfo });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating merchant info", error: error.message });
  }
};

/**
 * Get all merchant info entries with filtering, pagination, and sorting
 */
exports.getAllMerchantInfo = async (req, res) => {
  try {
    const { page = 1, limit = 6, sortBy = "fullName", order = "asc", fullName, businessName, address } = req.query;

    const filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (businessName) filter.businessName = { $regex: businessName, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const merchantInfoList = await Merchantinfo.find(filter).sort(sortOptions).skip(skip).limit(parseInt(limit));
    const totalDocuments = await Merchantinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    return res.status(200).json({ success: true, message: "Merchant info retrieved successfully", data: merchantInfoList, pagination: { currentPage: parseInt(page), totalPages, totalItems: totalDocuments, itemsPerPage: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving merchant info", error: error.message });
  }
};

/**
 * Get a single merchant info entry by ID
 */
exports.getMerchantInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantInfo = await Merchantinfo.findById(id);
    if (!merchantInfo) {
      return res.status(404).json({ success: false, message: "Merchant info not found" });
    }
    res.status(200).json({ success: true, message: "Merchant info retrieved successfully", data: merchantInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving merchant info", error: error.message });
  }
};

/**
 * Update merchant info by ID
 */
exports.updateMerchantInfo = [
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid merchant info ID format" });
      }

      const updateData = { ...req.body };
      if (req.file) updateData.profilePhoto = req.file.path;

      if (updateData.businessHours) {
        try {
          updateData.businessHours = JSON.parse(updateData.businessHours);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for businessHours" });
        }
      }
      if (updateData.highlightedStatement) {
        try {
          updateData.highlightedStatement = JSON.parse(updateData.highlightedStatement);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for highlightedStatement" });
        }
      }

      const updatedInfo = await Merchantinfo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedInfo) {
        return res.status(404).json({ success: false, message: "Merchant info not found" });
      }
      res.status(200).json({ success: true, message: "Merchant info updated successfully", data: updatedInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating merchant info", error: error.message });
    }
  },
];

/**
 * Delete merchant info by ID
 */
exports.deleteMerchantInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Merchantinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res.status(404).json({ success: false, message: "Merchant info not found" });
    }
    res.status(200).json({ success: true, message: "Merchant info deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting merchant info", error: error.message });
  }
};
