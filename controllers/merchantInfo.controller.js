const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const Merchantinfo = require("../models/merchantInfo.model");
const User = require("../models/user.model");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "merchant-profiles",
    allowedFormats: ["jpg", "jpeg", "png", "gif"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Multer upload middleware
const upload = multer({ storage: storage });

// Create a new merchant info
exports.createMerchantInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      const {
        userID,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours,
        highlightedStatement,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
      } = req.body;

      // Validate if the user exists
      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(400).json({ error: "Invalid userID. User does not exist." });
      }

      // Check if the user already has merchant info
      const existingMerchantInfo = await Merchantinfo.findOne({ userID });
      if (existingMerchantInfo) {
        return res.status(400).json({
          success: false,
          message: "Merchant info already exists for this user",
        });
      }

      // Parse business hours and highlighted statements
      let parsedBusinessHours = [];
      let parsedHighlightedStatements = [];
      try {
        parsedBusinessHours = JSON.parse(businessHours);
        parsedHighlightedStatements = JSON.parse(highlightedStatement);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for businessHours or highlightedStatement",
        });
      }

      // Get profile photo URL from Cloudinary
      const profilePhotoUrl = req.file ? req.file.path : null;

      // Create a new merchant info entry
      const newMerchantInfo = new Merchantinfo({
        userID,
        fullName,
        profilePhoto: profilePhotoUrl,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours: parsedBusinessHours,
        highlightedStatement: parsedHighlightedStatements,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
      });

      // Save the merchant info to the database
      const savedMerchantInfo = await newMerchantInfo.save();

      res.status(201).json({
        success: true,
        message: "Merchant info created successfully",
        data: savedMerchantInfo,
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating merchant info",
      error: error.message,
    });
  }
};

// Update a merchant info by ID
exports.updateMerchantInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      const {
        userID,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours,
        highlightedStatement,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
      } = req.body;

      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(400).json({ error: "Invalid userID. User does not exist." });
      }

      let parsedBusinessHours = [];
      let parsedHighlightedStatements = [];

      try {
        parsedBusinessHours = JSON.parse(businessHours);
        parsedHighlightedStatements = JSON.parse(highlightedStatement);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON format for businessHours or highlightedStatement" });
      }

      const profilePhotoUrl = req.file ? req.file.path : undefined;

      const updateData = {
        userID,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours: parsedBusinessHours,
        highlightedStatement: parsedHighlightedStatements,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
      };

      if (profilePhotoUrl) {
        updateData.profilePhoto = profilePhotoUrl;
      }

      const updatedMerchantInfo = await Merchantinfo.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedMerchantInfo) {
        return res.status(404).json({ message: "Merchant info not found" });
      }

      res.status(200).json(updatedMerchantInfo);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all merchant info
exports.getAllMerchantInfo = async (req, res) => {
  try {
    const { search, title, description, page = 1, limit = 10, sortBy = "businessName" } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    let query = {};
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
      ];
    }
    if (title || description) {
      query.highlightedStatement = {};
      if (title) {
        query.highlightedStatement.title = { $regex: title, $options: "i" };
      }
      if (description) {
        query.highlightedStatement.description = { $regex: description, $options: "i" };
      }
    }

    const skip = (pageNumber - 1) * limitNumber;

    const merchants = await Merchantinfo.find(query)
      .populate("userID")
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(limitNumber);

    const totalMerchants = await Merchantinfo.countDocuments(query);

    res.status(200).json({
      data: merchants,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMerchants / limitNumber),
        totalItems: totalMerchants,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single merchant info by ID
exports.getMerchantInfoById = async (req, res) => {
  try {
    const merchantInfo = await Merchantinfo.findById(req.params.id).populate("userID");
    if (!merchantInfo) {
      return res.status(404).json({ message: "Merchant info not found" });
    }
    res.status(200).json(merchantInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a merchant info by ID
exports.deleteMerchantInfo = async (req, res) => {
  try {
    const deletedMerchantInfo = await Merchantinfo.findByIdAndDelete(req.params.id);
    if (!deletedMerchantInfo) {
      return res.status(404).json({ message: "Merchant info not found" });
    }
    res.status(200).json({ message: "Merchant info deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};