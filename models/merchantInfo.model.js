const mongoose = require("mongoose");

const merchantInfoSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    profilePhoto: {
      type: String,
    },
    fullName: {
      type: String,
    },
    businessName: {
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
    about: {
      type: String,
    },
    shortDescriptionOfStore: {
      type: String,
    },
    stripeAccountId: {
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
        title: { type: String },
        description: { type: String },
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
      enum: ['approved', 'declined', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)


const Merchantinfo = mongoose.model("Merchantinfo", merchantInfoSchema);
module.exports = Merchantinfo;