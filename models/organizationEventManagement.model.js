const mongoose = require("mongoose");

const organizationEventManagementSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    eventTitle: {
      type: String,
    },
    description: {
      type: Number,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    paymentType: {
      type: String,
    },
    price: {
        type: String,
    },
    eventType: {
      type: String,
      enum:["paid event","free event", "volunteer event"]
    },
    eventCategory:{
      type: String,
      enum:["onsite","live"],
    },
    capacity:{
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

const Organizationeventmanagement = mongoose.model(
  "Organizationeventmanagement",
  organizationEventManagementSchema
);
module.exports = Organizationeventmanagement;
