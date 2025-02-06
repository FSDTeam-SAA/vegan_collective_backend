const mongoose = require('mongoose');

const professionalFAQSchema = new mongoose.Schema(
  {
    professionalID: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    question:{
      type: String,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Professionalfaq = mongoose.model("Professionalfaq", professionalFAQSchema);
module.exports = Professionalfaq;