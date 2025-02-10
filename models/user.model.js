const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin", "vendor"],
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
    accountType: {
      type: String,
      enum : ["merchant", "professional", "organization"],
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
    merchanInfo:[
      {
        businessName: {
          type: String,
          required: true,
        },
        address: {
          type: String,
        },
        aboutUs: {
          type: String,
        },
        websiteURL: {
          type: String,
        },
        governmentIssuedID: {
          type: String,
          required: true,
        },
        businessLicense: {
          type: String,
          required: true,
        },
        photoWithID: {
          type: String,
          required: true,
        },
        verificationStatus: {
          type: String,
          enum: ["verified", "not verified"],
          default: "not verified",
        },
      },
    ],
    organizationInfo:[
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
          enum: ["verified", "not verified"],
          default: "not verified",
        },
      }
    ],
    professionalInfo:[
      {
        designation:{
          type: String,
        },
        businessName:{
          type: String,
        },
        address: {
          type: String,
        },
        websiteURL:{
          type: String,
        },
        governmentIssuedID: {
          type: String,
          required: true,
        },
        professionalCertification: {
          type: String,
          required: true,
        },
        photoWithID: {
          type: String,
          required: true,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
