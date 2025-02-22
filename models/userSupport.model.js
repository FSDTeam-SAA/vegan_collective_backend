const mongoose = require('mongoose');

const userSupportSchema = new mongoose.Schema(
  { 
    userID:{
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    ticketSlug:{
      type: String,
    },
    name:{
        type: String,
    },
    email:{
        type: String,
    },
    subject: {
      type: String,
    },
    description: {
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

const Usersupport = mongoose.model("Usersupport", userSupportSchema);
module.exports = Usersupport;
