const mongoose = require("mongoose");

const professionalInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profilePhoto: {
      type: String,
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
    about: {
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
      
    },
    professionalCertification: {
      type: String,
     
    },
    photoWithID: {
      type: String,
      
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
