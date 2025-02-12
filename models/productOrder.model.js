const mongoose = require('mongoose');

const productOrderSchema = new mongoose.Schema(
  { 
    question:{
      type: String,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Productorder = mongoose.model("Productorder", productOrderSchema);
module.exports = Productorder;
