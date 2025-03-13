const mongoose = require('mongoose');

const zoomTokenSchema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresIn: { type: Number, required: true }, // Token expiration time in seconds
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ZoomToken', zoomTokenSchema);