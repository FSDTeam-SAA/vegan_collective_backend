const mongoose = require('mongoose');

const goLiveSchema = new mongoose.Schema(
  {
    eventTitle:{
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    time:{
      type: String,
      requried: true,
    },
    eventType:{
      type: String,
      enum: ["paid event","free event"],
    },
    price:{
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Golive = mongoose.model("Golive", goLiveSchema);
module.exports = Golive;