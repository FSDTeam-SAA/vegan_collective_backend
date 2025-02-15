const mongoose = require('mongoose')

const professionalServicesSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    QR: {
      type: String,
    },
    referNumber: {
      type: Number,
    },
    serviceName: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    serviceDescription: {
      type: String,
    },
    keyWords: [
      {
        type: String,
      },
    ],
    paymentType: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
    },
    serviceImage: {
      type: String,
    },
    serviceVideo: {
      type: String,
    },
    sessionType: {
      type: String,
    },
    },
  {
    timestamps: true,
  }
)

const Professionalservices = mongoose.model(
  'Professionalservices',
  professionalServicesSchema
)
module.exports = Professionalservices