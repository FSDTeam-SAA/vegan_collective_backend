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

    organizationInfo: [
      {
        organizationName: {
          type: String,
          required: true,
        },
        address: {
          type: String,
        },
        missionStatement: {
          type: String,
        },
        aboutUs: {
          type: String,
        },
        experienceAndCertifications: {
          type: String,
        },
        websiteURL: {
          type: String,
        },
        governmentIssuedID: {
          type: String,
          required: true,
        },
        charityRegistrationNumber: {
          type: String,
          required: true,
        },
        photoWithID: {
          type: String,
          required: true,
        },
        verificationStatus: {
          type: String,
          enum: ['verified', 'not verified'],
          default: 'not verified',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema);
module.exports = User;
