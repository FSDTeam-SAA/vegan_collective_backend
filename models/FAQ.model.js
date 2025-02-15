const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema(
  {
    ServiceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalservices',
    },
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const FAQ = mongoose.model("FAQ", FAQSchema);
module.exports = FAQ;
