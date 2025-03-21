const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByUpdateID,
  createLike,

  getCommentById,
} = require("../controllers/commentManipulation.controller");

// Create a new comment
router.post("/commentManipulation", createComment);


// Get all comments for a specific update
router.get("/commentManipulation/update/:updateAndNewsID", getCommentsByUpdateID);

// Get a specific comment by ID
router.get("/commentManipulation/comment/:id", getCommentById);


// Create a like for update and news
router.post("/commentManipulation/like", createLike);

module.exports = router;