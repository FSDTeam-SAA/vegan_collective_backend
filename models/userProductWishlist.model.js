const mongoose = require('mongoose');

const userProductWishlistSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    productID:{
      type: mongoose.Types.ObjectId,
      ref: 'MerchantProducts',
    },
  },
  {
    timestamps: true,
  }
)

const Userproductwishlist = mongoose.model("Userproductwishlist", userProductWishlistSchema);
module.exports = Userproductwishlist;