const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  professionalInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professionalinfo',
  },
  merchantInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchantinfo',
  },
  organizationInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizationinfo',
  },
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;