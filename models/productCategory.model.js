const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
  { 
    category:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Productcategory = mongoose.model("Productcategory", productCategorySchema);
module.exports = Productcategory;
