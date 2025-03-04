const mongoose = require('mongoose')

const userPaymentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    customerId: {
      type: String,
    },
    paymentMethodId: {
      type: String,
    },
    sellerStripeAccountId: {
      type: String,
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
