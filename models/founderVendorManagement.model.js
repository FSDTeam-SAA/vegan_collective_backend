const mongoose = require("mongoose");

const founderVendonManagementSchema = new mongoose.Schema(
  {
    merchants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Merchantinfo",
      },
    ],
    professionals: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Professionalinfo",
      },
    ],
    organizations: [
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
