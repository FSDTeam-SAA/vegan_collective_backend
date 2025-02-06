const mongoose = require('mongoose');

const professionalGoLiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    eventTitle:{
      type: String,
      requried: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      requried: true,
    },
    time:{
      type: Date,
      requried: true,
    },
    eventType:{
      type: String,
      enum: ["paid event","free event"],
      required: true
    },
    price:{
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Professionalgolive = mongoose.model("Professionalgolive", professionalGoLiveSchema);
module.exports = Professionalgolive;