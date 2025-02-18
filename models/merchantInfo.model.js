const mongoose = require("mongoose");
const merchantInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
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
    shortDescriptionOfStore: {
      type: String,
    },
    businessHours: [
      {
        Day: {
          type: String,
        },
        Time: {
          type: String,
        },
      },
    ],
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

const Merchantinfo = mongoose.model("Merchantinfo", merchantInfoSchema);
module.exports = Merchantinfo;
