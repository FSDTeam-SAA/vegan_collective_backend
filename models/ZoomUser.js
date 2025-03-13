const mongoose = require("mongoose");

const ZoomUserSchema = new mongoose.Schema(
  {
    professionalInfo: { type: mongoose.Schema.Types.ObjectId, ref: "ProfessionalInfo" },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant"},
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization"},
    zoomId: { type: String},
    email: { type: String},
    accessToken: { type: String},
    refreshToken: { type: String},
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ZoomUser", ZoomUserSchema);
