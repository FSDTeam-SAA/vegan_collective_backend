const mongoose = require("mongoose");

const merchantProductDelivarySchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    orderDetail: {
      type: mongoose.Types.ObjectId,   //order id,Customer Name, orderdate , amont info will be coming from this
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
