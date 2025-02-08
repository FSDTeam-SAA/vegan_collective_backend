const mongoose = require('mongoose');

const organizationEventManagementSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: 'Organizationinfo',
      required: true,
    },
    eventTitle: {
      type: String,
    },
    description:{
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: Date,
    },
    paymentType: {
      type: String,
    },
    priceIfPaid: {
      type: Number,
    },
    eventType: {
      type: String,
      enum: ["paid","free","volunteer"],
    },
  },
  {
    timestamps: true,
  }
);

const Organizationeventmanagement = mongoose.model("Organizationeventmanagement", organizationEventManagementSchema);
module.exports = Organizationeventmanagement;