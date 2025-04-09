const mongoose = require("mongoose");

const merchantGoLiveSchema = new mongoose.Schema(
  {
    merchantID: {
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
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["paid event", "free event"],
      required: true,
    },
    price: {
      type: Number,
      required: function () {
        return this.eventType === "paid event";
      },
    },
    eventId: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(), // Generate a unique ID
    },

    meetingId: {
      type: String,
    },

    meetingLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Merchantgolive = mongoose.model("Merchantgolive", merchantGoLiveSchema);
module.exports = Merchantgolive;
