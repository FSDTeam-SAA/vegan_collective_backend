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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
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
  limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 10MB
});

// Create a new professional service
exports.createProfessionalService = [
  upload.fields([{ name: 'serviceImage', maxCount: 1 }, { name: 'serviceVideo', maxCount: 1 }]), // Handle file uploads
  async (req, res) => {
    try {
      const { userID, QR, referNumber, serviceName, metaDescription, serviceDescription, keyWords, paymentType, price, sessionType } = req.body;

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

      // Extract file paths from multer
      const serviceImage = req.files['serviceImage'] ? req.files['serviceImage'][0].path : null;
      const serviceVideo = req.files['serviceVideo'] ? req.files['serviceVideo'][0].path : null;

      // Create the professional service
      const newService = new ProfessionalServices({
        userID,
        metaDescription,
        serviceDescription,
        keyWords,
        paymentType,
        price,
        serviceImage,
        serviceVideo,
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

// Other CRUD operations remain unchanged
exports.getAllProfessionalServices = async (req, res) => {
  try {
    const services = await ProfessionalServices.find().populate('userID', 'name email accountType');
    return res.status(200).json({
      success: true,
      message: "Professional services retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving professional services",
    });
  }
};

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

exports.updateProfessionalService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID format",
      });
    }

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
};

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