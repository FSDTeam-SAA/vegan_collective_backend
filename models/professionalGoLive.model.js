const mongoose = require("mongoose");

const goLiveSchema = new mongoose.Schema(
  {
    userID: {
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
    eventStatus: {
      type: String,
    },
    price: {
      type: Number,
      required: function () {
        return this.eventType === "paid event";
      },
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

const Golive = mongoose.model("Golive", goLiveSchema);
module.exports = Golive;
