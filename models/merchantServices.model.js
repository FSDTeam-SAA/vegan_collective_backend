const mongoose = require('mongoose');

const merchantServicesSchema = new mongoose.Schema(
  {
    merchantID:{
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    QR:{
      type: String,
    },
    referNumber:{
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
      }
    ],
    paymentType:[
      {
        type: String,
      }
    ],
    price:{
      type:Number,
    },
    serviceImage: {
      type: String,
    },
    serviceVideo: {
      type: String,
    },
    date:{
      type: String,
    },
    time: {
      type: String,
    },
    sessionType:{
      type: String,
    },
    statusType:{
      type: String,
      enum:["confirmed","pending","cancelled"]
    },
    orderSlug:{
      type: String,
    },
    FAQ:[
      {
        professionalServiceID: {
          type: mongoose.Types.ObjectId,
          ref: "FAQ",
        },
      }
    ],
    review:[
      {
        professionalServiceID: {
          type: mongoose.Types.ObjectId,
          ref: "Review",
        },
      }
    ],
    support:[
      {
        supportID: {
          type: mongoose.Types.ObjectId,
          ref: "Support",
        }
      }
    ],
    aboutMe: {
      type: String,
    },
    highlightedStatement: [
      {
        type: String,
      }
    ],
    experience: [
      {
        type: String,
      }
    ],
    certifications: [
      {
        type: String,
      }
    ],
    goLive:[
      {
        goLive: {
          type: mongoose.Types.ObjectId,
          ref: "Golive",
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Merchantservices = mongoose.model("Merchantservices", merchantServicesSchema);
module.exports = Merchantservices;
