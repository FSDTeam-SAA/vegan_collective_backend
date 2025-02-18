const cloudinary = require("../config/cloudinary.config");
const Professionalinfo = require("../models/professionalInfo.model");
const multer = require("multer");
const streamifier = require("streamifier");

// Multer configuration (store files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload an image to Cloudinary using a buffer
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

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

      // Upload each file to Cloudinary
      for (const field of ["governmentIssuedID", "professionalCertification", "photoWithID"]) {
        if (req.files[field]) {
          const file = req.files[field][0];

          // Validate file type
          if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({
              success: false,
              message: `${field} must be an image file.`,
            });
          }

          // Upload to Cloudinary
          uploadedImages[field] = await uploadToCloudinary(file.buffer);
        }
      }

      // Update or create the Professionalinfo document
      const professionalInfo = await Professionalinfo.findOneAndUpdate(
        { userID },
        { $set: uploadedImages },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        data: professionalInfo,
      });
    } catch (error) {
      console.error("Error in uploadImages:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading images.",
        error: error.message,
      });
    }
  },
];
