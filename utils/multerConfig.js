const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config(); // Ensure environment variables are loaded

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_photos",
    allowedFormats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload;
