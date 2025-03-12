const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor'],
    },
    fullName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ['merchant', 'professional', 'organization'],
    },
    image: {
      type: String,
    },
    verifyEmail: {
      type: Boolean,
      default: false,
    },
    forgotPasswordOtp: {
      type: String,
    },
    forgotPasswordOtpExpires: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    paymentAdded: {
      type: Boolean,
      default: false,
    },

    isgratings: {
      type: Boolean,
      default: false,
    },
    isVerified:{
      type: String,
      enum:["approved","declined","pending"],
      default:"pending",
    }
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema);
module.exports = User;
