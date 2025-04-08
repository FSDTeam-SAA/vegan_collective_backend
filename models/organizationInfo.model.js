const mongoose = require("mongoose");
const organizationInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    organizationName: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    address: {
      type: String,
    },
    country:{
      type: String,
    },
    state:{
      type: String,
    },
    city:{
      type: String,
    },
    missionStatement: {
      type: String,
    },
    about: {
      type: String,
    },
    shortDescriptionOfOrganization: {
      type: String,
    },
    stripeAccountId: {
      type: String,
    },
    experience: [
      {
        type: String,
      },
    ],
    certifications: [
      {
        type: String,
      },
    ],
    websiteURL: {
      type: String,
    },
    governmentIssuedID: {
      type: String,
    },
    professionalCertification: {
      type: String,
    },
    photoWithID: {
      type: String,
    },
    isVerified: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    phoneNumber: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
)

const Organizationinfo = mongoose.model("Organizationinfo", organizationInfoSchema);
module.exports = Organizationinfo;
