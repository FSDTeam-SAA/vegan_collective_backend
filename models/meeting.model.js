const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
    eventTitle: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  meetLink: {
    type: String,
    required: true,
  },
  calendarLink: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Meeting", meetingSchema);
