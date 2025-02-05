const mongoose = require('mongoose');

const delivaryManagementSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: 'Merchantinfo',
      required: true,
    },
    orderNo: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Delivarymanagement = mongoose.model("Delivarymanagement", delivaryManagementSchema);
module.exports = Delivarymanagement;