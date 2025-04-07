const mongoose = require("mongoose");

const storeReviewSchema = new mongoose.Schema(
  {
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    },
    merchantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchantinfo", 
    },
    rating: {
        type: Number,
      },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);


const Storereview = mongoose.model('Storereview', storeReviewSchema)
module.exports = Storereview;