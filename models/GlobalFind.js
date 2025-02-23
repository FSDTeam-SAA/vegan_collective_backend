const mongoose = require('mongoose');

const globalFindSchema = new mongoose.Schema({
  type: { type: String, enum: ['professional', 'merchant', 'organization'], required: true },
  merchant_id: { type: String, required: false },
  organization_id: { type: String, required: false },
  professional_id: { type: String, required: false },
  details: { type: Object, required: true }, // Store additional details
});

const GlobalFind = mongoose.model('GlobalFind', globalFindSchema);

module.exports = GlobalFind;