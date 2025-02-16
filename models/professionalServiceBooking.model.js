const mongoose = require('mongoose');

const professionalServiceBookingSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    professionalID: {
        type: mongoose.Types.ObjectId,
        ref: 'Professionalinfo',
    }, 
    bookingInfo:[
        {
            serviceID: {
                type: mongoose.Types.ObjectId,
                ref: 'ProfessionalServices',
            },
            date: {
                type: String,
            },
            time: {
                type: String,
            },
        }   
    ],
    payWith:{
        type: String,
    },
    cardHolderName:{
        type: String,
    },
    cardNumber:{
        type: String,
    },
    expiryDate:{
        type: String,
    },
    cvv:{
        type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Professionalservicebooking = mongoose.model("Professionalservicebooking", professionalServiceBookingSchema);
module.exports = Professionalservicebooking;