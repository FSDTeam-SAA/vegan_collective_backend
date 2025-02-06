const mongoose = require('mongoose');

const merchantHelpAndSupportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Merchantinfo',
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

const Merchanthelpandsupport = mongoose.model("Merchanthelpandsupport", merchantHelpAndSupportSchema);
module.exports = Merchanthelpandsupport;