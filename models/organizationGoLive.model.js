const mongoose = require("mongoose");

const organizationGoLiveSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    eventTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    eventType: {
      type: String,
      enum: ["paid event", "free event"],
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Organizationgolive = mongoose.model(
  "Organizationgolive",
  organizationGoLiveSchema
);
module.exports = Organizationgolive;
