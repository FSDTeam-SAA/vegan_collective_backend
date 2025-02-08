const mongoose = require('mongoose');

const userWishlistManagementSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    professionalID: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Professionalinfo',
      }
    ],
    merchantID: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Merchantinfo',
      }
    ],
    organizationID: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Organizationinfo',
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Userwishlistmanagement = mongoose.model("Userwishlistmanagement", userWishlistManagementSchema);
module.exports = Userwishlistmanagement;
