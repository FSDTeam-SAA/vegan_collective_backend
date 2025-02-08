const mongoose = require('mongoose');

const professionalClientInteractionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professionalID: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    service:{
      type: String,
      requried: true,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    status:{
      type: String,
      enum:["confirmed","pending"],
    },
  },
  {
    timestamps: true,
  }
);

const Professionalclientinteraction = mongoose.model("Professionalclientinteraction", professionalClientInteractionSchema);
module.exports = Professionalclientinteraction;