const mongoose = require("mongoose");
const organizationInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    organizationName: {
      type: String,
    },
    address: {
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
      required: true,
    },
    professionalCertification: {
      type: String,
      required: true,
    },
    photoWithID: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Organizationinfo = mongoose.model("Organizationinfo", organizationInfoSchema);
module.exports = Organizationinfo;
