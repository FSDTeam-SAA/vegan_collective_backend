const Professionalservices = require("../models/professionalServices.model");
const cloudinary = require("../config/cloudinary.config");

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload to Cloudinary: " + error.message);
  }
};

// Normalize sessionType to match Mongoose schema
const normalizeSessionType = (sessionType) => {
  const sessionTypeMapping = {
    "1-on-1 session": "1-on-1 session",
    "group session": "Group session", // Match the schema's capital 'G'
    "webinar": "Webinar", // Match the schema's capital 'W'
  };

  return sessionTypeMapping[sessionType?.trim().toLowerCase()] || null;
};

// Create a new service
const createService = async (req, res) => {
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
      visibility,
    } = req.body;

    let serviceImage = "";
    let serviceVideo = "";

    if (req.files?.serviceImage) {
      serviceImage = await uploadToCloudinary(req.files.serviceImage[0]);
    }
    if (req.files?.serviceVideo) {
      serviceVideo = await uploadToCloudinary(req.files.serviceVideo[0]);
    }

    // Normalize sessionType
    const normalizedSessionType = normalizeSessionType(sessionType);
    if (!normalizedSessionType) {
      return res.status(400).json({
        success: false,
        message: "Invalid sessionType provided. Allowed values: '1-on-1 session', 'Group session', 'Webinar'.",
      });
    }

    // Validate isLiveStream based on sessionType
    if ((normalizedSessionType === "1-on-1 session" || normalizedSessionType === "Group session") && isLiveStream !== "false") {
      return res.status(400).json({
        success: false,
        message: "For '1-on-1 session' or 'Group session', isLiveStream must be false.",
      });
    } else if (normalizedSessionType === "Webinar" && isLiveStream !== "true") {
      return res.status(400).json({
        success: false,
        message: "For 'Webinar', isLiveStream must be true.",
      });
    }

    // Ensure keywords is a valid array
    const keywordsArray =
      typeof keyWords === "string"
        ? JSON.parse(keyWords) // If keywords is a stringified array, parse it
        : Array.isArray(keyWords)
        ? keyWords
        : [];

    const newService = new Professionalservices({
      userID,
      serviceName,
      metaDescription,
      serviceDescription,
      keyWords: keywordsArray,
      paymentType,
      price,
      serviceImage,
      serviceVideo,
      sessionType: normalizedSessionType,
      isLiveStream: isLiveStream === "true",
      visibility,
    });

    await newService.save();
    res.status(201).json({ success: true, message: "Service created successfully!", service: newService });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Professionalservices.find();
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get offline services
const getOfflineServices = async (req, res) => {
  try {
    const services = await Professionalservices.find({ isLiveStream: false });
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get live services
const getLiveServices = async (req, res) => {
  try {
    const services = await Professionalservices.find({ isLiveStream: true });
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update service (handling form-data like createService)
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const existingService = await Professionalservices.findById(id);

    if (!existingService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

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
      visibility,
    } = req.body;

    let serviceImage = existingService.serviceImage;
    let serviceVideo = existingService.serviceVideo;

    if (req.files?.serviceImage) {
      serviceImage = await uploadToCloudinary(req.files.serviceImage[0]);
    }
    if (req.files?.serviceVideo) {
      serviceVideo = await uploadToCloudinary(req.files.serviceVideo[0]);
    }

    // Normalize sessionType
    const normalizedSessionType = normalizeSessionType(sessionType);
    if (!normalizedSessionType) {
      return res.status(400).json({
        success: false,
        message: "Invalid sessionType provided. Allowed values: '1-on-1 session', 'Group session', 'Webinar'.",
      });
    }

    // Ensure keywords is a valid array
    const keywordsArray =
      typeof keyWords === "string"
        ? JSON.parse(keyWords)
        : Array.isArray(keyWords)
        ? keyWords
        : [];

    const updatedService = await Professionalservices.findByIdAndUpdate(
      id,
      {
        userID,
        serviceName,
        metaDescription,
        serviceDescription,
        keyWords: keywordsArray,
        paymentType,
        price,
        serviceImage,
        serviceVideo,
        sessionType: normalizedSessionType,
        isLiveStream: isLiveStream === "true",
        visibility,
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Service updated successfully!", service: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Professionalservices.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, message: "Service deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  getOfflineServices,
  getLiveServices,
  updateService,
  deleteService,
};
