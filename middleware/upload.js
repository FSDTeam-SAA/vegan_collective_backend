const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and MP4 are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
