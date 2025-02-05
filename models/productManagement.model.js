const mongoose = require('mongoose');

const productManagementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Merchantinfo',
      required: true,
    },
    productName: {
      type: String,
      required :true,
    },
    description: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    price: {
      type: Number,
      requried: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    productImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Productmanagement = mongoose.model("Productmanagement", productManagementSchema);
module.exports = Productmanagement;