const mongoose = require('mongoose');

const orderDelivaryStatusSchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    orderStatus:{
      type: String,
      enum:["delivered", "shipped"],
    }
  },
  {
    timestamps: true,
  }
);

const Orderdelivarystatus = mongoose.model("Orderdelivarystatus", orderDelivaryStatusSchema);
module.exports = Orderdelivarystatus;