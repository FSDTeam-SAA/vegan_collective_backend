const Professionalservices = require("../models/professionalServices.model");
const cloudinary = require("../config/cloudinary.config");
const mongoose = require("mongoose");

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
      timeSlots,
      date,
    } = req.body;

    let serviceImage = "";
    let serviceVideo = "";

    if (req.files?.serviceImage) {
      serviceImage = await uploadToCloudinary(req.files.serviceImage[0]);
    }
    if (req.files?.serviceVideo) {
      serviceVideo = await uploadToCloudinary(req.files.serviceVideo[0]);
    }

  

    // Validate isLiveStream based on sessionType
    if ((sessionType === "1-on-1 session" || sessionType === "Group session") && isLiveStream !== "false") {
      return res.status(400).json({
        success: false,
        message: "For '1-on-1 session' or 'Group session', isLiveStream must be false.",
      });
    } else if (sessionType === "Webinar" && isLiveStream !== "true") {
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


        // Validate or format timeSlots (optional step)
   // Ensure timeSlots is stored as an array of strings
   const formattedTimeSlots =
   typeof timeSlots === "string"
     ? JSON.parse(timeSlots) // If received as a stringified array
     : Array.isArray(timeSlots)
     ? timeSlots.map(slot => slot.toString().trim()) // Ensure it's an array of strings
     : [];


     // Fix date format
     //Ensure date is in the correct format
     let formattedDate;
     if (typeof date === "string") {
       try {
         formattedDate = new Date(date).toISOString(); // Convert to ISO 8601 format
       } catch (error) {
         return res.status(400).json({
           success: false,
           message: "Invalid date format. Please provide a valid ISO 8601 date.",
         });
       }
     } else {
       formattedDate = new Date().toISOString(); // Default to current date-time if not provided
     }

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
      sessionType: sessionType,
      isLiveStream: isLiveStream === "true",
      visibility,
      timeSlots: formattedTimeSlots,
      date: formattedDate,
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

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid service ID" });
    }

    // Fetch the existing service
    const existingService = await Professionalservices.findById(id);
    if (!existingService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    console.log("Existing Service:", existingService);

    // Destructure the request body
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
      timeSlots,
      date,
    } = req.body;

    // Default service images and videos
    let serviceImage = existingService.serviceImage;
    let serviceVideo = existingService.serviceVideo;

    // Handle file uploads for images and videos
    if (req.files?.serviceImage) {
      console.log("Uploading service image...");
      serviceImage = await uploadToCloudinary(req.files.serviceImage[0]);
      console.log("Uploaded Image URL:", serviceImage);
    }

    if (req.files?.serviceVideo) {
      console.log("Uploading service video...");
      serviceVideo = await uploadToCloudinary(req.files.serviceVideo[0]);
      console.log("Uploaded Video URL:", serviceVideo);
    }

    // Ensure keywords is an array of strings
    const keywordsArray =
      typeof keyWords === "string"
        ? JSON.parse(keyWords)
        : Array.isArray(keyWords)
        ? keyWords
        : [];

    // Ensure timeSlots is stored as an array of strings
    const formattedTimeSlots =
      typeof timeSlots === "string"
        ? JSON.parse(timeSlots) // If received as a stringified array
        : Array.isArray(timeSlots)
        ? timeSlots.map((slot) => slot.toString().trim()) // Ensure it's an array of strings
        : [];

    // Ensure date is in the correct format
    let formattedDate;
    if (typeof date === "string") {
      try {
        formattedDate = new Date(date).toISOString(); // Convert to ISO 8601 format
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please provide a valid ISO 8601 date.",
        });
      }
    } else {
      formattedDate = new Date().toISOString(); // Default to current date-time if not provided
    }

    // Update the service in the database
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
        sessionType,
        isLiveStream: isLiveStream === "true", // Convert to boolean
        visibility,
        timeSlots: formattedTimeSlots,
        date: formattedDate,
      },
      { new: true } // Return the updated service
    );

    console.log("Updated Service:", updatedService);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error during update:", error);
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

// Get all services by userID
const getUserServices = async (req, res) => {
  try {
    const { userID } = req.params;
    const services = await Professionalservices.find({ userID });

    if (!services.length) {
      return res.status(200).json({ 
        success: true, 
        message: "No services found for this user.", 
        data: [] 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Services retrieved successfully",
      data: services 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: []
    });
  }
};

// Get offline services by professional ID (1-on-1 session or Group session)
const getOfflineServicesByProfessionalId = async (req, res) => {
  try {
    const { userID } = req.params;

    const services = await Professionalservices.find({
      userID,
      isLiveStream: false,
      sessionType: { $in: ["1-on-1 session", "Group session"] },
    });

    if (!services.length) {
      return res.status(200).json({
        success: true,
        message: "No offline services found for this professional.",
        data: [], // Return an empty array
      });
    }

    res.status(200).json({ success: true, message: "Offline services retrieved successfully.", data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get online services by professional ID (Webinar only)
const getOnlineServicesByProfessionalId = async (req, res) => {
  try {
    const { userID } = req.params;

    const services = await Professionalservices.find({
      userID,
      isLiveStream: true,
      sessionType: "Webinar",
    });

    if (!services.length) {
      return res.status(200).json({
        success: true,
        message: "No online services (Webinar) found for this professional.",
        data: []
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Online services retrieved successfully",
      data: services 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: []
    });
  }
};



module.exports = {
  createService,
  getAllServices,
  getOfflineServices,
  getLiveServices,
  updateService,
  deleteService,
  getUserServices,
  getOfflineServicesByProfessionalId,
  getOnlineServicesByProfessionalId,
  
};
