const mongoose = require("mongoose");

const organizationFundraisingManagementSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    campaignTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    fundraisingGoal: {
      type: Number,
    },
    achieved:{
      type: Number,
    },
    deadline: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Organizationfundraisingmanagement = mongoose.model(
  "Organizationfundraisingmanagement",
  organizationFundraisingManagementSchema
);
module.exports = Organizationfundraisingmanagement;
