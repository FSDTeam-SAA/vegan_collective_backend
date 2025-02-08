const mongoose = require('mongoose');

const organizationHelpAndSupportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Organizationinfo',
      required: true,
    },
    slug:{
      type: String,
    },
    subject: {
      type: String,
      requried : true,
    },
    message: {
      type: String,
      requried: true,
    },
    status:{
      type: String,
      enum:["resolved","in progress","pending"],
    }
  },
  {
    timestamps: true,
  }
);

const Organizationhelpandsupport = mongoose.model("Organizationhelpandsupport", organizationHelpAndSupportSchema);
module.exports = Organizationhelpandsupport;