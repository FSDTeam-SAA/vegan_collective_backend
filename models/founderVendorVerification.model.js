const mongoose = require('mongoose');

const founderVendorVerificationSchema = new mongoose.Schema(
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

const Foundervendorverification = mongoose.model("Foundervendorverification", founderVendorVerificationSchema);
module.exports = Foundervendorverification;