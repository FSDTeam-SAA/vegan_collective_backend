const mongoose = require("mongoose");

const organizationEventManagementSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    eventTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    paymentType: {
      type: String,
    },
    price: {
      type: String,
      required: function () {
        return this.eventType === "paid event"; // Price is required only for paid events
      },
      default: null, // Default value is null
    }, // Default value is null
  
    eventType: {
      type: String,
      enum:["paid event","free event", "volunteer event"]
    },
    eventCategory:{
      type: String,
      enum:["onsite","live"],
    },
    capacity:{
      type: Number,
    },
    Attendees: {
      type: Number,
      ref:"Organizationeventbooking",
      default: 0,
      
    }
    
  },
  {
    timestamps: true,
  }
);

const Organizationeventmanagement = mongoose.model(
  "Organizationeventmanagement",
  organizationEventManagementSchema
);  
module.exports = Organizationeventmanagement;
