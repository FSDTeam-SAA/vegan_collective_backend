const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    email: { type: String, required: true },
    title: { type: String, required: true },
    datetime: { type: Date, required: true },
    type: { type: String, required: true },
});

module.exports = mongoose.model('Event', eventSchema);