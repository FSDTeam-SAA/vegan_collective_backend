const mongoose = require("mongoose");

const organizationVolunteerSchema = new mongoose.Schema(
  {
    organizationEventID: {
      type: mongoose.Types.ObjectId,
      ref: "Organizationeventmanagement", // Refers to the Organizationeventmanagement model
    },
    attendeeDetail: [
      {
        fullName: {
          type: String,
        },
        email: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        userID: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        skillAndExperience: {
          type: String,
        },
        motivationalStatement: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const OrganizationVolunteer = mongoose.model(
  "OrganizationVolunteer",
  organizationVolunteerSchema
);

module.exports = OrganizationVolunteer;