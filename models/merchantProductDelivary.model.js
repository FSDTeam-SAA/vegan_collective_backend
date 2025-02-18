const mongoose = require("mongoose");

const merchantProductDelivarySchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    orderDetail: {
      type: mongoose.Types.ObjectId,   //Customer Name and Contact info will be coming from this
      ref: "Merchantsalesmanagement",
    },
    trackingNumber:{
        type: String,
    },
    shipping:{
        type: String,
        enum:["delivered", "shipped"],
    },
  },
  {
    timestamps: true,
  }
);

const Merchantproductdelivary = mongoose.model(
  "Merchantproductdelivary",
  merchantProductDelivarySchema
);
module.exports = Merchantproductdelivary;
