const mongoose = require('mongoose');

const vendorManagementSchema = new mongoose.Schema(
  {
    vendorID: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    onboardingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum:["approved","pending","declined"],
    },
  },
  {
    timestamps: true,
  }
);

const Vendormanagement = mongoose.model("Vendormanagement", vendorManagementSchema);
module.exports = Vendormanagement;