const mongoose = require('mongoose');

const goLiveSchema = new mongoose.Schema(
  {
     userID: {
         type: mongoose.Types.ObjectId,
         ref: 'User',
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
      required: true,
    },
    eventType: {
      type: String,
      enum: ['paid event', 'free event'],
    },
    rice: {
      type: Number,
      required: function () {
        return this.eventType === 'paid event';
      },
    },
  },
  {
    timestamps: true,
  }
)

const Golive = mongoose.model("Golive", goLiveSchema);
module.exports = Golive;