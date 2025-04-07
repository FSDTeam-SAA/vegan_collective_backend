const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema(
  { 
    professionalID:{
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    ticketSlug:{
      type: String,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    status:{
      type: String,
      enum:["resolved","pending","in progress"]
    }
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model("Support", supportSchema);
module.exports = Support;
