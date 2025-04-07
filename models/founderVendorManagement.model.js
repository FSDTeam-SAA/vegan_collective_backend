const mongoose = require("mongoose");

const founderVendonManagementSchema = new mongoose.Schema(
  {
    merchant: [
      {
        type: mongoose.Types.ObjectId, 
        ref: "Merchantinfo",
      },
    ],
    professional: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Professionalinfo",
      },
    ],
    organization: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Organizationinfo",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Foundervendonmanagement = mongoose.model(
  "Foundervendonmanagement",
  founderVendonManagementSchema
);
module.exports = Foundervendonmanagement;
