const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const ProfessionalServices = require('../models/professionalServices.model'); // Adjust the path as needed
const User = require('../models/user.model'); // Adjust the path as needed

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  },
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png','image/jpg', 'image/gif', 'video/mp4', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WEBM) are allowed.'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 500MB
});

// Middleware to handle Multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error details:", err);
    return res.status(400).json({
      success: false,
      message: `Multer error: ${err.message}`,
    });
  } else if (err) {
    console.error("Other error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Create a new professional service
exports.createProfessionalService = [
  upload.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'serviceVideo', maxCount: 1 },
  ]),
  handleMulterErrors,
  async (req, res) => {
    try {
      const {
        userID,
        serviceName,
        metaDescription,
        serviceDescription,
        keyWords,
        paymentType,
        price,
        sessionType,
        isLiveStream,
      } = req.body;

      // Trim and sanitize inputs
      const sanitizedUserID = userID?.trim().replace(/^"|"$/g, ''); // Remove extra quotes
      if (!mongoose.Types.ObjectId.isValid(sanitizedUserID)) {
        console.log("Invalid userID format:", sanitizedUserID);
        return res.status(400).json({
          success: false,
          message: "Invalid userID format",
        });
      }

      // Check if the user exists and has an account type of "professional"
      const user = await User.findById(sanitizedUserID);
      if (!user) {
        console.log("User not found for userID:", sanitizedUserID);
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

      // Validate sessionType and isLiveStream combination
      if (sessionType === "Webinar" && isLiveStream !== 'true') {
        return res.status(400).json({
          success: false,
          message: "For Webinar session type, isLiveStream must be true",
        });
      }
      if (["one on one", "group"].includes(sessionType) && isLiveStream !== 'false') {
        return res.status(400).json({
          success: false,
          message: "For one on one or group session types, isLiveStream must be false",
        });
      }

      // Extract file paths from multer
      const serviceImage = req.files['serviceImage'] ? req.files['serviceImage'][0].path : null;
      const serviceVideo = req.files['serviceVideo'] ? req.files['serviceVideo'][0].path : null;

      // Create the professional service
      const newService = new ProfessionalServices({
        userID: sanitizedUserID,
        serviceName: serviceName?.trim(),
        metaDescription: metaDescription?.trim(),
        serviceDescription: serviceDescription?.trim(),
        keyWords: JSON.parse(keyWords || '[]'), // Parse array from string
        paymentType: paymentType?.trim(),
        price: Number(price), // Convert to number
        sessionType: sessionType?.trim(),
        serviceImage,
        serviceVideo,
        isLiveStream: isLiveStream === 'true', // Convert string to boolean
      });

      await newService.save();
      return res.status(201).json({
        success: true,
        message: "Professional service created successfully",
        data: newService,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error while creating professional service",
      });
    }
  },
];

// Get all professional services with filtering
exports.getAllProfessionalServices = async (req, res) => {
  try {
    // Fetch all professional services from the database
    const allServices = await ProfessionalServices.find().populate('userID', 'name email accountType');

    // Filter services based on session type and isLiveStream
    const filteredServices = allServices.filter(service => {
      if (service.sessionType === "ebinar") {
        // Only include Webinar services that are live streams
        return service.isLiveStream === true;
      }
      // Include "one on one" and "group" session types only if isLiveStream is false
      return ["one on one", "group"].includes(service.sessionType) && service.isLiveStream === false;
    });

    return res.status(200).json({
      success: true,
      message: "Professional services retrieved successfully",
      data: filteredServices,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving professional services",
    });
  }
};

// Get a single professional service by ID
exports.getProfessionalServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID format",
      });
    }

    const service = await ProfessionalServices.findById(id).populate('userID', 'name email accountType');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Professional service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professional service retrieved successfully",
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving professional service",
    });
  }
};

// Update a professional service
exports.updateProfessionalService = [
  upload.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'serviceVideo', maxCount: 1 },
  ]),
  handleMulterErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Validate if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID format",
        });
      }

      // Extract data from the request body
      const {
        serviceName,
        metaDescription,
        serviceDescription,
        keyWords,
        paymentType,
        price,
        sessionType,
        isLiveStream,
      } = req.body;

      // Initialize an object to hold the fields to be updated
      const updateData = {};

      // Add fields to updateData only if they are present in the request
      if (serviceName) updateData.serviceName = serviceName.trim();
      if (metaDescription) updateData.metaDescription = metaDescription.trim();
      if (serviceDescription) updateData.serviceDescription = serviceDescription.trim();
      if (keyWords) updateData.keyWords = JSON.parse(keyWords || '[]'); // Parse array from string
      if (paymentType) updateData.paymentType = paymentType.trim();
      if (price) updateData.price = Number(price); // Convert to number
      if (sessionType) updateData.sessionType = sessionType.trim();
      if (isLiveStream) updateData.isLiveStream = isLiveStream === 'true'; // Convert string to boolean

      // Handle file uploads
      if (req.files['serviceImage']) {
        updateData.serviceImage = req.files['serviceImage'][0].path;
      }
      if (req.files['serviceVideo']) {
        updateData.serviceVideo = req.files['serviceVideo'][0].path;
      }

      // Validate sessionType and isLiveStream combination
      if (updateData.sessionType === "Webinar" && updateData.isLiveStream !== true) {
        return res.status(400).json({
          success: false,
          message: "For Webinar session type, isLiveStream must be true",
        });
      }
      if (["one on one", "group"].includes(updateData.sessionType) && updateData.isLiveStream !== false) {
        return res.status(400).json({
          success: false,
          message: "For one on one or group session types, isLiveStream must be false",
        });
      }

      // Update the professional service
      const updatedService = await ProfessionalServices.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedService) {
        return res.status(404).json({
          success: false,
          message: "Professional service not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Professional service updated successfully",
        data: updatedService,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error while updating professional service",
      });
    }
  },
];

// Delete a professional service
exports.deleteProfessionalService = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID format",
      });
    }

    const deletedService = await ProfessionalServices.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Professional service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professional service deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting professional service",
    });
  }
};