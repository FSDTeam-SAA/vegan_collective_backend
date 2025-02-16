const mongoose = require('mongoose');

const professionalFAQSchema = new mongoose.Schema(
  {
    userID: {
             type: mongoose.Types.ObjectId,
             ref: 'User',
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

const professionalFAQ = mongoose.model("professionalFAQ", professionalFAQSchema);
module.exports = professionalFAQ;
