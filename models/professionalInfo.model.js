const mongoose = require("mongoose");

const professionalInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    fullName: {
      type: String,
    },
    designation: {
      type: String,
    },
    businessName: {
      type: String,
    },
    address: {
      type: String,
    },
    aboutMe: {
      type: String,
    },
    highlightedStatement: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
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

const Professionalinfo = mongoose.model(
  "Professionalinfo",
  professionalInfoSchema
);
module.exports = Professionalinfo;
