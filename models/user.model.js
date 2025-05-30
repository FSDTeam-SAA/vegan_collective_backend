const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin", "vendor", "verifier", "superadmin"],
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
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["merchant", "professional", "organization"],
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
    isVerified: {
      type: String,
      enum: ["approved", "declined", "pending"],
      default: "pending",
    },
    address: {
      type: String,
    },
    bio: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    grandEmail: {
      type: String,
    },
    grandId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
