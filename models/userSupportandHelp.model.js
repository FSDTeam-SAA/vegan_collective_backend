const mongoose = require('mongoose');

const userSupportandHelpSchema = new mongoose.Schema(
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

const Usersupportandhelp = mongoose.model("Usersupportandhelp", userSupportandHelpSchema);
module.exports = Usersupportandhelp;