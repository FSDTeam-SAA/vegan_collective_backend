const mongoose = require('mongoose');
const Golive = require('../models/professionalGoLive.model'); // Adjust the path as needed
const User = require('../models/user.model'); // Adjust the path as needed

// Create a new event
exports.createEvent = async (req, res) => {
  try {
      let { professionalID, eventTitle, description, date, time, eventType, price } = req.body;

      // Validate professionalID format
      if (!mongoose.Types.ObjectId.isValid(professionalID)) {
          return res.status(400).json({ success: false, message: 'Invalid professional ID' });
      }

      // Remove price if eventType is "free event"
      if (eventType === 'free event') {
          price = undefined;
      }

      const newEvent = new ProfessionalGoLive({
          professionalID,
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

// Get all events with optional filters for type and professionalID
exports.getAllEvents = async (req, res) => {
  const { type, professionalID } = req.query;
  try {
      let filter = {}; // Default: No filter, fetch all events

      // Add professionalID filter if provided
      if (professionalID) {
          if (!mongoose.Types.ObjectId.isValid(professionalID)) {
              return res.status(400).json({ success: false, message: 'Invalid professional ID' });
          }
          filter.professionalID = professionalID;
      }

      let events = await ProfessionalGoLive.find(filter);
      const currentDate = new Date();

      // Filter events based on type
      if (type === 'upcoming') {
          events = events.filter(event => new Date(event.date) >= currentDate);
      } else if (type === 'past') {
          events = events.filter(event => new Date(event.date) < currentDate);
      }

      if (events.length === 0) {
          return res.status(200).json({ success: true, message: `No ${type ? type : ''} events found.`, events: [] });
      }

      res.status(200).json({ success: true, message: `Successfully retrieved ${events.length} event(s).`, events });
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

      const event = await ProfessionalGoLive.findById(id);
      if (!event) {
          return res.status(404).json({ success: false, message: 'No event found with the given ID' });
      }

      res.status(200).json({ success: true, message: 'Event retrieved successfully', event });
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

      const updatedEvent = await ProfessionalGoLive.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

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

      const deletedEvent = await ProfessionalGoLive.findByIdAndDelete(id);
      if (!deletedEvent) {
          return res.status(404).json({ success: false, message: 'Event not found' });
      }

      res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};