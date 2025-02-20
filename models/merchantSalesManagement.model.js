const mongoose = require("mongoose");

const merchantSalesManagementSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    orderSlug: {
      type: String,
    },
    userID: {
      type: mongoose.Types.ObjectId, //Customer Name and Contact Info will come from here
      ref: "User",
    },
    orderedItem: [
      {
        productID: {
          type: mongoose.Types.ObjectId, //Ordered Item Name will come from here
          ref: "MerchantProducts",
        },
        quantity: {
          type: Number, //Quantity will come from here
        },
      },
    ],
    price:{
      type: Number,
    },
    status: {
      type: String,
      enum: ["fulfilled", "pending", "cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

const Merchantsalesmanagement = mongoose.model(
  "Merchantsalesmanagement",
  merchantSalesManagementSchema
);
module.exports = Merchantsalesmanagement;
