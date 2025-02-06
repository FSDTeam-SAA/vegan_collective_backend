const mongoose = require('mongoose');

const vendorVerificationSchema = new mongoose.Schema(
  {
    vendorID: {
      type: mongoose.Types.ObjectId,
      ref: 'Productorder',
      required: true,
    },
    verificationID: {
      type: mongoose.Types.ObjectId,
      ref: 'Vendormanagement',
      required: true,
    },
    requestAdditionalInfo: {
      type: String,
    },
    declineApplication: {
      type: String,
    },
    decision:{
      type: String,
      enum:["approved","decline"],
    },
  },
  {
    timestamps: true,
  }
);

const Vendorverification = mongoose.model("Vendorverification", vendorVerificationSchema);
module.exports = Vendorverification;