const Golive = require('../models/professionalGoLive.model'); // Adjust the path as necessary
const mongoose = require('mongoose');

// Create a new live event
exports.createLiveEvent = async (req, res) => {
  try {
    const { userID, eventTitle, description, date, time, eventType, price } = req.body;

    if (eventType === 'paid event' && price === undefined) {
      return res.status(400).json({ success: false, message: 'Price is required for paid events' });
    }

    const newEvent = new Golive({
      userID,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price: eventType === 'paid event' ? price : undefined,
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
};

// Get live events based on status (upcoming or past) and userID
exports.getLiveEvents = async (req, res) => {
  try {
    const { type, userID } = req.query;

    if (!type || !userID) {
      return res.status(400).json({ success: false, message: 'Type and userID are required' });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    let query = { userID };
    
    if (type === 'upcoming') {
      query.date = { $gte: currentDate };
    } else if (type === 'past') {
      query.date = { $lt: currentDate };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type. Use "upcoming" or "past"' });
    }

    const events = await Golive.find(query);
    const eventsWithStatus = events.map(event => ({
      ...event.toObject(),
      eventStatus: event.date >= currentDate ? 'upcoming' : 'past'
    }));

    res.status(200).json({ success: true, message: 'Events fetched successfully', events: eventsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await Golive.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Event fetched successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
};


// Update all fields of an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userID, eventTitle, description, date, time, eventType, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    if (eventType === 'paid event' && price === undefined) {
      return res.status(400).json({ success: false, message: 'Price is required for paid events' });
    }

    const updatedEvent = await Golive.findByIdAndUpdate(
      id,
      {
        userID,
        eventTitle,
        description,
        date,
        time,
        eventType,
        price: eventType === 'paid event' ? price : undefined,
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const deletedEvent = await Golive.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
};
