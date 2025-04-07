const mongoose = require('mongoose');

const organizationSupportSchema = new mongoose.Schema(
  { 
    organizationID:{
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    ticketSlug:{
      type: String,
      unique: true,
    },
    name:{
      type: String,
    },
    emailAddress:{
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

const Organizationsupport = mongoose.model("Organizationsupport", organizationSupportSchema);
module.exports = Organizationsupport;
