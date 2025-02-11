const Golive = require('../models/professionalGoLive.model'); // Import the Golive model
const User = require('../models/user.model'); // Assuming you have a User model
const mongoose = require('mongoose'); // Import Mongoose for ObjectId validation

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { userId, eventTitle, description, date, time, eventType, price } = req.body;

        // Validate if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the event
        const newEvent = new Golive({
            eventTitle,
            description,
            date,
            time,
            eventType,
            price,
            userId, // Associate the event with the user
        });

        // Save the event to the database
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single event by ID
exports.getEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Validate if the eventId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        // Find the event by ID
        const event = await Golive.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all events (optionally filtered by userId)
exports.getAllEvents = async (req, res) => {
    try {
        let query = {};

        // If userId is provided, validate it and filter events by userId
        if (req.query.userId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            const user = await User.findById(req.query.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            query.userId = req.query.userId; // Filter events by userId
        }

        // Fetch all events matching the query
        const events = await Golive.find(query);

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
    try {
        const { eventId, userId, ...updateData } = req.body;

        // Validate if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate if the eventId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        // Find the event by ID and update it
        const updatedEvent = await Golive.findByIdAndUpdate(
            eventId,
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId, userId } = req.body;

        // Validate if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate if the eventId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        // Find the event by ID and delete it
        const deletedEvent = await Golive.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};