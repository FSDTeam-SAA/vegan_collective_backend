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
    },
    paymentMethodId: {
      type: String,
    },
    sellerID: {
      type: mongoose.Types.ObjectId,
    },
    sellerType: {
      type: String,
      enum: ['Merchant', 'Professional', 'Organization'],
    },
    sellerStripeAccountId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    professionalServicesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professionalservices',
      default: null,
    },
    organizationGoLiveID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizationgolive',
      default: null,
    },
    serviceBookingTime: {
      type: String,
      default: null,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MerchantProducts',
      },
    ],
    status: {
      type: String,
      enum: ['cancel', 'confirmed'],
      default: 'confirmed',
    },
    // bookingID: {
    //   type: String,
    //   unique: true,
    //   default: null,
    // },

    bookingID: {
      type: String,
      unique: true,
      default: function() {
        return mongoose.Types.ObjectId().toString(); // Or any other unique ID generation
      },
    },
    goLiveID: {
      type: String,
      default: null,
    },
    shippingStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
)

const Userpayment = mongoose.model('Userpayment', userPaymentSchema)
module.exports = Userpayment
