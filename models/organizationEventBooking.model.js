const mongoose = require("mongoose");

const organizationEventBookingSchema = new mongoose.Schema(
  {
    organizationEventID: {
      type: mongoose.Types.ObjectId,
      ref: "Organizationeventmanagement",  //in the organizationeventmanagement model comes eventTitle, eventType,price,Attendees,date,time
    },
    attendeeDetail: [
      {
        bookingSlug: {
          type: String,
        },
        fullName: {
          type: String,
        },
        email: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        specialRequirement: {
          type: String,
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

const Organizationeventbooking = mongoose.model(
  "Organizationeventbooking",
  organizationEventBookingSchema
);
module.exports = Organizationeventbooking;
