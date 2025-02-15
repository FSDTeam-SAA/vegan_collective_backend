const mongoose = require('mongoose');

const merchantGoLiveSchema = new mongoose.Schema(
  {
    merchantID: {
      type: mongoose.Types.ObjectId,
      ref: 'merchantServices',
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
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

const Golive = mongoose.model('MerchantGoLive', merchantGoLiveSchema)
module.exports = Golive;