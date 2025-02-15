const mongoose = require('mongoose')

const merchantPolicyDefinition = new mongoose.Schema({
  ServiceId: {
    type: mongoose.Types.ObjectId,
    ref: 'Merchantservices',
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

const merchantPolicySchema = mongoose.model(
  'MerchantPolicies',
  merchantPolicyDefinition
)

module.exports = merchantPolicySchema
