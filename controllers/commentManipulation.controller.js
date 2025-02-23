const CommentManipulation = require("../models/commentManipulation.model");
const User = require("../models/user.model"); // Ensure you have the User model imported
const OrganizationUpdateAndNews = require("../models/organizationUpdateAndNews.model"); // Import the OrganizationUpdateAndNews model

// Create a comment for an organization update
const createComment = async (req, res) => {
  try {
    const { updateAndNewsID, userID, comment } = req.body;

    if (!updateAndNewsID || !userID || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create the new comment
    const newComment = new CommentManipulation({
      updateAndNewsID,
      userID,
      comment,
    });

    // Save the new comment
    await newComment.save();

    // Update the corresponding OrganizationUpdateAndNews document
    const updatedUpdate = await OrganizationUpdateAndNews.findByIdAndUpdate(
      updateAndNewsID,
      { $push: { comments: newComment._id } }, // Add the new comment's ID to the comments array
      { new: true } // Return the updated document
    );

    if (!updatedUpdate) {
      return res.status(404).json({ error: "Organization update not found" });
    }

    res.status(201).json({
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all comments for a specific organization update
const getCommentsByUpdateID = async (req, res) => {
  try {
    const { updateAndNewsID } = req.params;

    const comments = await CommentManipulation.find({ updateAndNewsID })
      .populate("userID", "fullName") // Ensure "userID" is referencing the User model
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentManipulation.findById(id).populate("userID", "name");

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createComment,
  getCommentsByUpdateID,
  getCommentById,
};