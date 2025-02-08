const mongoose = require("mongoose");

const merchantGoLiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Merchantinfo",
      required: true,
    },
    eventTitle: {
      type: String,
      requried: true,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
      requried: true,
    },
    time: {
      type: String,
      requried: true,
    },
    eventType: {
      type: String,
      enum: ["paid event", "free event"],
      required: true,
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Merchantgolive = mongoose.model("Merchantgolive", merchantGoLiveSchema);
module.exports = Merchantgolive;
