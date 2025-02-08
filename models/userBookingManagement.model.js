const mongoose = require('mongoose');

const userBookingManagementSchema = new mongoose.Schema(
  {
    bookingID: {
      type: String,
    },
    professionalID: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
    },
    professionalServiceID:{
      type: mongoose.Types.ObjectId,
      ref: 'Professionalservices',
    },
    status:{
      type: String,
      enum:["upcoming","completed"],
    },
  },
  {
    timestamps: true,
  }
);

const Userbookingmanagement = mongoose.model("Userbookingmanagement", userBookingManagementSchema);
module.exports = Userbookingmanagement;
