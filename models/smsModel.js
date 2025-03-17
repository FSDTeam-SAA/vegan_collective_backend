const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  twilioSid: {
    type: String,
  },
  status: {
    type: String,
    default: "sent", // Can be "sent", "failed", etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sms = mongoose.model("Sms", smsSchema);
module.exports = Sms;
