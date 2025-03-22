const CommentManipulation = require("../models/commentManipulation.model");
const User = require("../models/user.model"); // Ensure you have the User model imported
const OrganizationUpdateAndNews = require("../models/organizationUpdateAndNews.model"); // Import the OrganizationUpdateAndNews model

// Create a comment for an organization update
const createComment = async (req, res) => {
  try {
    const { updateAndNewsID, userID, comment } = req.body;

    if (!updateAndNewsID || !userID || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
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
      return res.status(404).json({
        success: false,
        message: "Organization update not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all comments for a specific organization update
const getCommentsByUpdateID = async (req, res) => {
  try {
    const { updateAndNewsID } = req.params;

    const comments = await CommentManipulation.find({ updateAndNewsID })
      .populate("userID", "fullName") // Ensure "userID" is referencing the User model
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentManipulation.findById(id).populate("userID", "name");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Like an organization update
const createLike = async (req, res) => {
  try {
    const { updateAndNewsID, userID } = req.body

    if (!updateAndNewsID || !userID) {
      return res.status(400).json({
        success: false,
        message: 'Both updateAndNewsID and userID are required',
      })
    }

    // Check if the update exists
    const update = await OrganizationUpdateAndNews.findById(updateAndNewsID)
    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Organization update not found',
      })
    }

    // Check if the user has already liked the update
    const likeIndex = update.likedBy.indexOf(userID)

    if (likeIndex === -1) {
      // User hasn't liked yet, so add like
      update.likedBy.push(userID)
      await update.save()
      return res.status(200).json({
        success: true,
        message: 'Like added successfully',
        data: {
          _id: update._id,
          organizationID: update.organizationID,
          title: update.title,
          image: update.image,
          shortDescription: update.shortDescription,
          statement: update.statement,
          comments: update.comments,
          likedBy: update.likedBy, // Now this will be an array of user IDs
          createdAt: update.createdAt,
          updatedAt: update.updatedAt,
        },
      })
    } else {
      // User has already liked, so remove the like
      update.likedBy.splice(likeIndex, 1)
      await update.save()
      return res.status(200).json({
        success: true,
        message: 'Like removed successfully',
        data: {
          _id: update._id,
          organizationID: update.organizationID,
          title: update.title,
          image: update.image,
          shortDescription: update.shortDescription,
          statement: update.statement,
          comments: update.comments,
          likedBy: update.likedBy, // Updated likedBy array
          createdAt: update.createdAt,
          updatedAt: update.updatedAt,
        },
      })
    }
  } catch (error) {
    console.error('Error liking/unliking organization update:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}


// like the comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const userId = req.body.userId

    if (!userId) {
      return res.status(400).json({ success: false , message: 'User ID is required' })
    }

    const comment = await CommentManipulation.findById(commentId)
    if (!comment) {
      return res.status(404).json({  success: false, message: 'Comment not found' })
    }

    const index = comment.likedBy.indexOf(userId)

    if (index === -1) {
      // Like the comment
      comment.likedBy.push(userId)
    } else {
      // Unlike the comment
      comment.likedBy.splice(index, 1)
    }

    await comment.save()

    return res.status(200).json({  success: true, message: 'Like status updated', comment })
  } catch (error) {
    return res
      .status(500)
      .json({  success: false, message: 'Server error', error: error.message })
  }
}

// Get API to Retrieve Like Count
const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params

    const comment = await CommentManipulation.findById(commentId)
    if (!comment) {
      return res.status(404).json({  success: false, message: 'Comment not found' })
    }

    return res.status(200).json({  success: true,
      commentId: comment._id,
      totalLikes: comment.likedBy.length,
      likedByUsers: comment.likedBy,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message })
  }
}


module.exports = {
  createComment,
  getCommentsByUpdateID,
  getCommentById,
  createLike,
  likeComment,
  getCommentLikes,
}
