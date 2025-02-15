const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    serviceID: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalservices',
    },
    rating: {
      type: Number,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;