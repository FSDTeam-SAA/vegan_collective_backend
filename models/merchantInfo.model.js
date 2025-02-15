const mongoose = require('mongoose');
const merchantInfoSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  businessName: {
    type: String,
  },
  address: {
    type: String,
  },
  aboutMe: {
    type: String,
  },
  websiteURL: {
    type: String,
  },
  governmentIssuedID: {
    type: String,
    required: true,
  },
  professionalCertification: {
    type: String,
    required: true,
  },
  photoWithID: {
    type: String,
    required: true,
  },
})

const MerchantInfo = mongoose.model('MerchantInfo', merchantInfoSchema);
module.exports = MerchantInfo;