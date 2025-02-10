const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    joinAs: {
      type: String,
      enum : ["customer", "vendor"],
      required: true,
    },
    accountType: {
      type: String,
      enum : ["merchant", "professional", "organization"],
    
    }, 
    fullName: { 
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
