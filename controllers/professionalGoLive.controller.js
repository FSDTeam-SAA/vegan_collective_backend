const Golive = require('../models/professionalGoLive.model');

// Create a new event
// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { userID, eventTitle, description, date, time, eventType, price } = req.body;
    
    // Check if the event is paid and price is not provided
    if (eventType === 'paid event' && !price) {
      return res.status(400).json({ message: 'Price is required for paid events.' });
    }

    const newEvent = new Golive({
      userID,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events with filtering by type (upcoming/past) and professionalID
exports.getEvents = async (req, res) => {
  try {
    const { type, professionalID } = req.query;

    let query = {};

    // Filter by professionalID if provided
    if (professionalID) {
      query.userID = professionalID; // Ensure this matches the ObjectId format in MongoDB
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Add logic to filter by event type (upcoming or past)
    if (type === 'upcoming') {
      query.date = { $gte: today }; // Events with date greater than or equal to today
    } else if (type === 'past') {
      query.date = { $lt: today }; // Events with date less than today
    }

    // Fetch events from the database
    const events = await Golive.find(query).populate('userID', 'name email'); // Populate user details

    // Add event status (upcoming or past) to each event in the response
    const formattedEvents = events.map(event => {
      const eventStatus = event.date >= today ? 'upcoming' : 'past';
      return { ...event._doc, eventStatus };
    });

    res.status(200).json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Golive.findById(req.params.id).populate('userID', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const eventStatus = event.date >= today ? 'upcoming' : 'past';

    res.status(200).json({ ...event._doc, eventStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const { eventTitle, description, date, time, eventType, price } = req.body;

    // Check if the event is paid and price is not provided
    if (eventType === 'paid event' && !price) {
      return res.status(400).json({ message: 'Price is required for paid events.' });
    }

    const updatedEvent = await Golive.findByIdAndUpdate(
      req.params.id,
      { eventTitle, description, date, time, eventType, price },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Golive.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};