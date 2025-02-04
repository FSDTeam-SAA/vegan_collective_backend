const mongoose = require('mongoose');

const organizationInfoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    }, 
    organizationName: {
      type: String,
      required: true,          
    },
    address: {
      type: String,
    },
    missionStatement: {
      type: String,
    },
    aboutUs: {
      type: String,
    },
    experienceAndCertifications: {
      type: String,
    },
    websiteURL: {
      type: String,
    },
    governmentIssuedID: {
      type: String,
      required: true,
    },
    charityRegistrationNumber: {
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

const Organizationinfo = mongoose.model("Organizationinfo", organizationInfoSchema);
module.exports = Organizationinfo;