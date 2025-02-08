const Professionalgolive = require('../models/professionalGoLive.model');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { user, eventTitle, description, date, time, eventType, price } = req.body;

    // Validate required fields
    if (!user || !eventTitle || !date || !time || !eventType) {
      return res.status(400).json({
        status: false,
        message: "All required fields must be provided.",
      });
    }

    // Create a new event
    const newEvent = new Professionalgolive({
      user,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price: eventType === 'paid event' ? price : 0, // Set price to 0 for free events
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();
    res.status(201).json({
      status: true,
      message: "Event created successfully",
      data: savedEvent,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    // Fetch all events without populating the 'user' field
    const events = await Professionalgolive.find().exec();
    res.status(200).json({
      status: true,
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    // Find the event by ID without populating the 'user' field
    const event = await Professionalgolive.findById(req.params.id).exec();

    if (!event) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const { eventTitle, description, date, time, eventType, price } = req.body;

    // Find the event by ID and update it
    const updatedEvent = await Professionalgolive.findByIdAndUpdate(
      req.params.id,
      {
        eventTitle,
        description,
        date,
        time,
        eventType,
        price: eventType === 'paid event' ? price : 0, // Ensure price is 0 for free events
      },
      { new: true } // Return the updated document
    ).exec();

    if (!updatedEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    // Find the event by ID and delete it
    const deletedEvent = await Professionalgolive.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};