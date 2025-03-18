const mongoose = require('mongoose');

const organizationReviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: 'Organizationinfo',
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

const Organizationreview = mongoose.model("Organizationreview", organizationReviewSchema);
module.exports = Organizationreview;