const mongoose = require('mongoose');

const orderSalesStatusSchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    salesStatus:{
      type: String,
      enum: ["pending", "fulfilled", "cancelled"],
    }
  },
  {
    timestamps: true,
  }
);

const Ordersalesstatus = mongoose.model("Ordersalesstatus", orderSalesStatusSchema);
module.exports = Ordersalesstatus;