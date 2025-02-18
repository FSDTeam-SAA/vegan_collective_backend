const mongoose = require('mongoose');

const merchantReviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
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

const Merchantreview = mongoose.model("Merchantreview", merchantReviewSchema);
module.exports = Merchantreview;