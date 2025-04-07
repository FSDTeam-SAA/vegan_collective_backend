const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByUpdateID,
  createLike,

  getCommentById,
  likeComment,
  getCommentLikes,
} = require('../controllers/commentManipulation.controller')

// Create a new comment
router.post("/commentManipulation", createComment);


// Get all comments for a specific update
router.get("/commentManipulation/update/:updateAndNewsID", getCommentsByUpdateID);

// Get a specific comment by ID
router.get("/commentManipulation/comment/:id", getCommentById);


// Create a like for update and news
router.post("/commentManipulation/like", createLike);

router.post('/like/:commentId', likeComment)
router.get('/likes/:commentId', getCommentLikes)

module.exports = router;