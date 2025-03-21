const OrganizationUpdateAndNews = require("../models/organizationUpdateAndNews.model");
const upload = require("../utils/multerConfig");

const createOrganizationUpdate = async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: "Image file is required" });
      }

      const { title, shortDescription, statement, organizationID } = req.body;

      // Ensure shortDescription is always a string
      const formattedShortDescription = Array.isArray(shortDescription)
          ? shortDescription.join(" ")
          : shortDescription;

      const newUpdate = new OrganizationUpdateAndNews({
          organizationID,
          title,
          image: req.file.path, // Cloudinary URL
          shortDescription: formattedShortDescription,
          statement,
          likedBy: [] // Initialize likedBy as an empty array
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
        const updates = await OrganizationUpdateAndNews.find()
            .populate("organizationID", "_id") 
            .populate("likedBy", "_id") // Populate likedBy field
            .lean(); 
  
        const formattedUpdates = updates.map(update => ({
            ...update,
            organizationID: update.organizationID?._id || update.organizationID, 
            likedBy: update.likedBy.map(user => ({
                userIDWhoLiked: user._id, // Format likedBy to an array of objects
            })),
        }));
  
        res.status(200).json({ success: true, message: "Organization updates fetched successfully", data: formattedUpdates });
    } catch (error) {
        console.error("Error fetching organization updates:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  
//get all organization updates by organizationID

const getAllOrganizationUpdatesByOrganizationID = async (req, res) => {
  try {
      const { organizationID } = req.params;

      if (!organizationID) {
          return res.status(400).json({ success: false, message: "Organization ID is required" });
      }

      const updates = await OrganizationUpdateAndNews.find({ organizationID })
          .populate("organizationID", "_id") 
          .populate("likedBy", "_id") // Populate likedBy field
          .lean(); 

      const formattedUpdates = updates.map(update => ({
          ...update,
          organizationID: update.organizationID?._id || update.organizationID, 
          likedBy: update.likedBy.map(user => ({
              userIDWhoLiked: user._id, // Format likedBy to match the required structure
          })),
      }));

      res.status(200).json({ success: true, message: "Organization updates fetched successfully", data: formattedUpdates });
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

module.exports = { createOrganizationUpdate, getAllOrganizationUpdates,getAllOrganizationUpdatesByOrganizationID, getOrganizationUpdateById };
