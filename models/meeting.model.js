const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    zoomId: { type: String, required: true, unique: true },
    meetingId: { type: String, required: true },
    startUrls: { type: [String], default: [] },  // Ensure array type
    joinUrls: { type: [String], default: [] }    // Ensure array type
});

module.exports = mongoose.model('Meeting', meetingSchema);
