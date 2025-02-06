const mongoose = require('mongoose');

const professionalPoliciesSchema = new mongoose.Schema(
  {
    professionalID: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    beforeAppointment:{
      type: String,
    },
    afterAppointment: {
      type: String,
    },
    cancellationWindow: {
      type: String,
    },
    noShowPolicy:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Professionalpolicies = mongoose.model("Professionalpolicies", professionalPoliciesSchema);
module.exports = Professionalpolicies;