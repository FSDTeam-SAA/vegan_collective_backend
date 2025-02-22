const Merchantgolive = require('../models/merchantGoLive.model');
const mongoose = require('mongoose');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        let { merchantID, eventTitle, description, date, time, eventType, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(merchantID)) {
            return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
        }

        if (eventType === 'free event') {
            price = undefined;
        }

        const newEvent = new Merchantgolive({
            merchantID,
            eventTitle,
            description,
            date,
            time,
            eventType,
            price
        });

        await newEvent.save();
        res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all events with optional filters for type and merchantID
exports.getAllEvents = async (req, res) => {
    const { type, merchantID } = req.query;
    try {
        let filter = {};

        if (merchantID) {
            if (!mongoose.Types.ObjectId.isValid(merchantID)) {
                return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
            }
            filter.merchantID = merchantID;
        }

        let events = await Merchantgolive.find(filter);
        const currentDate = new Date();

        if (type === 'upcoming') {
            events = events.filter(event => new Date(event.date) >= currentDate);
        } else if (type === 'past') {
            events = events.filter(event => new Date(event.date) < currentDate);
        }

        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        const event = await Merchantgolive.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        let { eventTitle, description, date, time, eventType, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        let updateFields = { eventTitle, description, date, time, eventType };

        if (eventType === 'free event') {
            updateFields.price = null;
        } else {
            updateFields.price = price;
        }

        const updatedEvent = await Merchantgolive.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        const deletedEvent = await Merchantgolive.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get events by status (true/false)
exports.getEventsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (status !== 'true' && status !== 'false') {
            return res.status(400).json({ success: false, message: 'Invalid status value, must be "true" or "false"' });
        }

        const events = await Merchantgolive.find({ status: status === 'true' });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};