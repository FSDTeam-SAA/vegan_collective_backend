const mongoose = require("mongoose");

const ZoomMeetingSchema = new mongoose.Schema(
  {
   
    professionalInfo: { type: mongoose.Schema.Types.ObjectId, ref: "ProfessionalInfo",  },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant",},
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization",  },
    zoomMeetingId: { type: String, },
    hostId: { type: String, },
    hostEmail: { type: String,  },
    topic: { type: String, },
    startTime: { type: Date,},
    duration: { type: Number,  },
    timezone: { type: String,},
    startUrl: { type: String,},
    joinUrl: { type: String, },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ZoomMeeting", ZoomMeetingSchema);
