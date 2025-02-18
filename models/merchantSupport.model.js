const mongoose = require('mongoose');

const merchantSupportSchema = new mongoose.Schema(
  { 
    merchantID:{
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

const Merchantsupport = mongoose.model("Merchantsupport", merchantSupportSchema);
module.exports = Merchantsupport;
