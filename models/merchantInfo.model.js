const mongoose = require('mongoose');

const merchantInfoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    aboutUs: {
      type: String,
    },
    websiteURL: {
      type: String,
    },
    governmentIssuedID: {
      type: String,
      required : true,
    },
    businessLicense: {
      type: String,
      required: true,
    },
    photoWithID: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["verified", "not verified"],
      default: "not verified",
    },
  },
  {
    timestamps: true,
  }
);     

const Merchantinfo = mongoose.model("Merchantinfo", merchantInfoSchema);
module.exports = Merchantinfo;