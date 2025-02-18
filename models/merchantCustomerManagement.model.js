const mongoose = require('mongoose');

const merchantCustomerManagementSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
    },
    whatsApp: {
      type: String,
    },
    messenger: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Merchantcustomermanagement = mongoose.model("Merchantcustomermanagement", merchantCustomerManagementSchema);
module.exports = Merchantcustomermanagement;