const cloudinary = require("../config/cloudinary.config");
const Professionalinfo = require("../models/professionalInfo.model");
const Merchantinfo = require("../models/merchantInfo.model");
const multer = require("multer");
const mongoose = require("mongoose");

// Multer configuration for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Upload images to Cloudinary and update Professionalinfo
exports.uploadImages = [
  upload.fields([
    { name: "governmentIssuedID", maxCount: 1 },
    { name: "professionalCertification", maxCount: 1 },
    { name: "photoWithID", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { userID } = req.body;
      if (!userID) {
        return res.status(400).json({
          success: false,
          message: "userID is required.",
        });
      }

      const uploadedImages = {};

      const uploadToCloudinary = (fileBuffer, field) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(fileBuffer);
        });
      };

      for (const field of ["governmentIssuedID", "professionalCertification", "photoWithID"]) {
        if (req.files[field]) {
          const file = req.files[field][0];
          if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({
              success: false,
              message: `${field} must be an image file.`,
            });
          }
          try {
            uploadedImages[field] = await uploadToCloudinary(file.buffer, field);
          } catch (uploadError) {
            console.error(`Error uploading ${field}:`, uploadError);
            return res.status(500).json({
              success: false,
              message: `Failed to upload ${field}.`,
              error: uploadError.message || "Unknown error",
            });
          }
        }
      }

      const professionalInfo = await Professionalinfo.findOneAndUpdate(
        { userId: userID }, // ✅ Change userID to userId to match schema
        { ...uploadedImages },
        { new: true, upsert: true }
      );
      

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        data: professionalInfo,
      });
    } catch (error) {
      console.error("Error in uploadImages:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading images.",
        error: error.message || "Unknown error",
      });
    }
  },
];

exports.uploadMerchantImages = [
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "governmentIssuedID", maxCount: 1 },
    { name: "professionalCertification", maxCount: 1 },
    { name: "photoWithID", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { userID } = req.body;

      // Validate userID
      if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing userID.",
        });
      }

      // Check if files were uploaded
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded.",
        });
      }

      const uploadedImages = {};
      const uploadToCloudinary = (fileBuffer, field) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(fileBuffer);
        });
      };

      for (const field of ["profilePhoto", "governmentIssuedID", "professionalCertification", "photoWithID"]) {
        if (req.files[field]) {
          const file = req.files[field][0];
          if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({
              success: false,
              message: `${field} must be an image file.`,
            });
          }
          try {
            uploadedImages[field] = await uploadToCloudinary(file.buffer, field);
          } catch (uploadError) {
            console.error(`Error uploading ${field}:`, uploadError);
            return res.status(500).json({
              success: false,
              message: `Failed to upload ${field}.`,
              error: uploadError.message || "Unknown error",
            });
          }
        }
      }

      // Update merchant info
      const merchantInfo = await Merchantinfo.findOneAndUpdate(
        { userID },
        { ...uploadedImages },
        { new: true, upsert: true }
      );

      if (!merchantInfo) {
        return res.status(404).json({
          success: false,
          message: "Merchant info not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        data: merchantInfo,
      });
    } catch (error) {
      console.error("Error in uploadImages:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading images.",
        error: error.message || "Unknown error",
      });
    }
  },
];
    
