const mongoose = require("mongoose");

const professionalServicesSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
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
    paymentType: 
      {
        type: String,
      },
    
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
      enum: ["1-on-1 session", "Group session", "Webinar"],
      required: true,
    },
    isLiveStream: { 
      type: Boolean, 
      default: false
     },
     visibility: {
      type: Boolean, 
      enum: ["true", "false"],
      default: "true"
    },

    timeSlots: [
      {
        type: String,
      }
    ],
    date: {
      type: String,
    },
    
  },
  {
    timestamps: true,
  }
);

const Professionalservices = mongoose.model(
  "Professionalservices",
  professionalServicesSchema
);
module.exports = Professionalservices;
