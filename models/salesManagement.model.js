const mongoose = require('mongoose');

const salesManagementSchema = new mongoose.Schema(
  {
    orderNo: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    salesStatus: {
      type: mongoose.Types.ObjectId,
      ref: 'Ordersalesstatus',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Salesmanagement = mongoose.model("Salesmanagement", salesManagementSchema);
module.exports = Salesmanagement;