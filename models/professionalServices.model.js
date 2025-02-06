const mongoose = require('mongoose');

const professionalServicesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Professionalinfo',
      required: true,
    },
    serviceName:{
      type: String,
      requried: true,
    },
    metaDescription: {
      type: String,
    },
    serviceDescription: {
      type: Date,
      requried: true,
    },
    keywords:[
      {
        type: String,
      }
    ],
    paymentType:{
      type: String,
      required: true
    },
    price:{
      type: Number,
    },
    addImage:{
      type: String,
    },
    addVideo:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Professionalservices = mongoose.model("Professionalservices", professionalServicesSchema);
module.exports = Professionalservices;