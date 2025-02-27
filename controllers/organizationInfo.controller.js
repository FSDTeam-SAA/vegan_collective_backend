const express = require("express");
const mongoose = require("mongoose");
const Organizationinfo = require("../models/organizationInfo.model");
const User = require("../models/user.model");
const upload = require("../utils/multerConfig");

/**
 * Create a new organization info entry with profile photo upload
 */
exports.createOrganizationInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      let { userID, organizationName, address, missionStatement, about, shortDescriptionOfOrganization, experience, certifications, websiteURL, governmentIssuedID, professionalCertification, photoWithID,isVerified } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ success: false, message: "Invalid userID format" });
      }

      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "User does not exist" });
      }

      const existingOrganizationInfo = await Organizationinfo.findOne({ userID });
      if (existingOrganizationInfo) {
        return res.status(400).json({ success: false, message: "Organization info already exists for this user" });
      }

      let parsedExperience = [];
      let parsedCertifications = [];
      
      try {
        if (experience) parsedExperience = JSON.parse(experience);
        if (certifications) parsedCertifications = JSON.parse(certifications);
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for experience or certifications" });
      }

      const profilePhotoUrl = req.file ? req.file.path : null;

      const newOrganizationInfo = new Organizationinfo({
        userID,
        profilePhoto: profilePhotoUrl,
        organizationName,
        address,
        missionStatement,
        about,
        shortDescriptionOfOrganization,
        experience: parsedExperience,
        certifications: parsedCertifications,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      });

      const savedOrganizationInfo = await newOrganizationInfo.save();
      res.status(201).json({ success: true, message: "Organization info created successfully", data: savedOrganizationInfo });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating organization info", error: error.message });
  }
};

/**
 * Get all organization info entries
 */
exports.getAllOrganizationInfo = async (req, res) => {
  try {
    // Extract query parameters for pagination, search, and sorting
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const searchQuery = req.query.search || ""; // Default to empty string if no search term is provided
    const sortBy = req.query.sortBy || "organizationName"; // Default to sorting by organizationName
    const sortOrder = req.query.sortOrder || "asc"; // Default to ascending order

    // Build the filter for searching by organizationName
    const filter = searchQuery
      ? { organizationName: { $regex: searchQuery, $options: "i" } } // Case-insensitive regex search
      : {};

    // Calculate total items and total pages
    const totalItems = await Organizationinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Define the sort order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1; // 1 for ascending, -1 for descending

    // Fetch paginated and sorted results
    const organizationInfoList = await Organizationinfo.find(filter)
      .sort(sortOptions) // Apply sorting
      .skip((page - 1) * limit) // Skip documents based on the current page
      .limit(limit); // Limit the number of documents per page

    // Construct the pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
    };

    // Return the response with data and pagination metadata
    return res.status(200).json({
      success: true,
      message: "Organization info retrieved successfully",
      data: organizationInfoList,
      pagination: pagination,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      success: false,
      message: "Error retrieving organization info",
      error: error.message,
    });
  }
};

/**
 * Get a single organization info entry by ID
 */
exports.getOrganizationInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationInfo = await Organizationinfo.findById(id);
    if (!organizationInfo) {
      return res.status(404).json({ success: false, message: "Organization info not found" });
    }
    res.status(200).json({ success: true, message: "Organization info retrieved successfully", data: organizationInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving organization info", error: error.message });
  }
};

/**
 * Update organization info by ID
 */
exports.updateOrganizationInfo = [
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid organization info ID format" });
      }

      const updateData = { ...req.body };
      if (req.file) updateData.profilePhoto = req.file.path;

      if (updateData.experience) {
        try {
          updateData.experience = JSON.parse(updateData.experience);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for experience" });
        }
      }
      if (updateData.certifications) {
        try {
          updateData.certifications = JSON.parse(updateData.certifications);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for certifications" });
        }
      }

      const updatedInfo = await Organizationinfo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedInfo) {
        return res.status(404).json({ success: false, message: "Organization info not found" });
      }
      res.status(200).json({ success: true, message: "Organization info updated successfully", data: updatedInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating organization info", error: error.message });
    }
  },
];

/**
 * Delete organization info by ID
 */
exports.deleteOrganizationInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Organizationinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res.status(404).json({ success: false, message: "Organization info not found" });
    }
    res.status(200).json({ success: true, message: "Organization info deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting organization info", error: error.message });
  }
};
