const mongoose = require('mongoose');

const organizationFundraisingManagementSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: 'Organizationinfo',
      required: true,
    },
    campaign: [
      {
        campaignTitle: {
          type: String,
        },
        description:{
          type: String,
        },
        fundraisingGoal: {
          type: Number,
        },
        goalAchieved: {
          type: Number,
        },
        deadLine: {
          type: Date,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Organizationgundraisingmanagement = mongoose.model("Organizationgundraisingmanagement", organizationFundraisingManagementSchema);
module.exports = Organizationgundraisingmanagement;