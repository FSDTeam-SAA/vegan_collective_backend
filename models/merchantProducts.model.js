const mongoose = require("mongoose");

const merchantProductsSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    productName: {
      type: String,
    },
    description: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    price: {
      type: Number,
    },
    stockQuantity: {
      type: Number,
    },
    category: {
      type: String,
      enum: ["food", "wearable", "medicine", "accessories"],
    },
    tags: [
      {
        type: String,
      },
    ],
    productImage: {
      type: String,
    },
    visibility: {
      type: Boolean,
      default: true,
        
    },
    stockStatus: {
      type: String,
      enum: ["in stock", "out of stock", "low stock"],
    }
  },
  {
    timestamps: true,
  }
);

const MerchantProducts = mongoose.model(
  "MerchantProducts",
  merchantProductsSchema
);
module.exports = MerchantProducts;
