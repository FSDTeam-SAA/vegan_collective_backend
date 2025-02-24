const mongoose = require("mongoose");

const ZoomUserSchema = new mongoose.Schema({
  zoomId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ZoomUser", ZoomUserSchema);