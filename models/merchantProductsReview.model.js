const mongoose = require("mongoose");

const merchantProductsReviewSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    productID: {
      type: mongoose.Types.ObjectId,
      ref: "MerchantProducts",
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
);

const Merchantproductsreview = mongoose.model(
  "Merchantproductsreview",
  merchantProductsReviewSchema
);
module.exports = Merchantproductsreview;
