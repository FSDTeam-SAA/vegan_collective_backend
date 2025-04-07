const OrganizationUpdateAndNews = require("../models/organizationUpdateAndNews.model");
const upload = require("../utils/multerConfig");

const createOrganizationUpdate = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Image file is required" });
      }
  
      const { title, shortDescription, statement, organizationID } = req.body;
  
      // Force shortDescription to be a string (convert array to string if needed)
      const formattedShortDescription = Array.isArray(shortDescription)
        ? shortDescription.join(" ") // Merge into one string
        : shortDescription;
  
      const newUpdate = new OrganizationUpdateAndNews({
        organizationID,
        title,
        image: req.file.path, // Cloudinary URL
        shortDescription: formattedShortDescription, // Store as string
        statement,
      });
  
      await newUpdate.save();
  
      res.status(201).json({
        success: true,
        message: "Organization update created successfully",
        data: newUpdate,
      });
    } catch (error) {
      console.error("Error creating organization update:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  // Get all organization updates
const getAllOrganizationUpdates = async (req, res) => {
    try {
      const updates = await OrganizationUpdateAndNews.find().populate("organizationID", "name"); // Populate organization name
      res.status(200).json({ success: true, message: "Organization updates fetched successfully", data: updates });
    } catch (error) {
      console.error("Error fetching organization updates:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  // Get an organization update by ID
  const getOrganizationUpdateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the organization update and populate the comments field
        const update = await OrganizationUpdateAndNews.findById(id)
            .populate("organizationID", "name") // Populate organization details
            .populate({
                path: "comments", // Populate the comments array
                select: "userID comment", // Only include userID and comment fields
                populate: {
                    path: "userID", // Populate the userID inside each comment
                    select: "fullName", // Fetch fullName instead of just ID
                },
            });

        if (!update) {
            return res.status(404).json({ success: false, message: "Organization update not found" });
        }

        // Transform the comments array into the correct structure
        const transformedUpdate = {
            ...update.toObject(), // Convert Mongoose document to a plain object
            comments: update.comments.map((comment) => ({
                userID: comment.userID._id, // Include userID
                comment: comment.comment, // Include comment text
            })),
        };

        res.status(200).json({ success: true, message: "Organization update fetched successfully", data: transformedUpdate });
    } catch (error) {
        console.error("Error fetching organization update by ID:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { createOrganizationUpdate, getAllOrganizationUpdates, getOrganizationUpdateById };
