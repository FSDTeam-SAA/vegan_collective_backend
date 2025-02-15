const mongoose = require('mongoose')

const professionalPolicySchema = new mongoose.Schema({
  ServiceId: {
    type: mongoose.Types.ObjectId,
    ref: 'Professionalservices',
  },
  beforeAppointment: {
    type: String,
  },
  afterAppointment: {
    type: String,
  },
  cancellationWindow: {
    type: String,
  },
  noShowPolicy: {
    type: String,
  },
})

const professionalPolicy = mongoose.model(
  'professionalPolicies',
  professionalPolicySchema
)

module.exports = professionalPolicy
