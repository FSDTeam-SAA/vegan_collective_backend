const mongoose = require('mongoose');

const professionalHelpAndSupportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    slug:{
      type: String,
      unique: true,
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
      default: "pending"
    }
  },
  {
    timestamps: true,
  }
);

const Professionalhelpandsupport = mongoose.model("Professionalhelpandsupport", professionalHelpAndSupportSchema);
module.exports = Professionalhelpandsupport;