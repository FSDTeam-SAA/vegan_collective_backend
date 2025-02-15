const mongoose = require('mongoose')

const merchantProductsSchema = new mongoose.Schema({
  userID : {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  productName: {
    type: String,
  },
  description: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  price: {
    type: Number,
  },
  stockQuantity: {
    type: Number,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: 'Productcategory',
  },
  tags: [
    {
      type: String,
    },
  ],
  productImage: {
    type: String,
  },
  visibility: {
    type: Boolean,
  },
  stockStatus: {
    type: String,
    enum: ['in stock', 'out of stock', 'low stock'],
  },
  trackingNumber: {
    type: String,
    unique: true,
  },
  trackingNumber: {
    type: String,
    unique: true,
  },
})

const MerchantProducts = mongoose.model(
  'MerchantProducts',
  merchantProductsSchema
)
module.exports = MerchantProducts
