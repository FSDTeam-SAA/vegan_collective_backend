const mongoose = require('mongoose');

const userVolunteerManagementSchema = new mongoose.Schema(
  // {
  //   userID: {
  //     type: mongoose.Types.ObjectId,
  //     ref: 'User',
  //   },
  //   productOrderID: [
  //     {
  //       type: mongoose.Types.ObjectId,
  //       ref: 'Productorder',
  //     }
  //   ],
  //   shippingStatus: [
  //     {
  //       type: String,
  //       enum:["delivered","shipped","pending"],
  //     }
  //   ],
  // },
  {
    timestamps: true,
  }
);

const Uservolunteermanagement = mongoose.model("Uservolunteermanagement", userVolunteerManagementSchema);
module.exports = Uservolunteermanagement;
