const mongoose = require('mongoose');

const founderSupportandHelpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Foundersupportandhelp = mongoose.model("Foundersupportandhelp", founderSupportandHelpSchema);
module.exports = Foundersupportandhelp;