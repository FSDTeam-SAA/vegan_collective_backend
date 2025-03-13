const mongoose = require('mongoose')

const userPaymentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    paymentMethodId: {
      type: String,
      required: true,
    },
    sellerID: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    sellerType: {
      type: String,
      enum: ['Merchant', 'Professional', 'Organization'],
      required: true,
    },
    sellerStripeAccountId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    professionalServicesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professionalservices',
      default: null,
    },
    serviceBookingTime: {
      type: Date,
      default: null,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MerchantProducts',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Userpayment = mongoose.model('Userpayment', userPaymentSchema)
module.exports = Userpayment
