const mongoose = require('mongoose');

const userProductOrderManagementSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    productOrderID: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
    },
    shipping:{
      type: String,
      enum:["delivered","shipped","pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Userproductordermanagement = mongoose.model("Userproductordermanagement", userProductOrderManagementSchema);
module.exports = Userproductordermanagement;
