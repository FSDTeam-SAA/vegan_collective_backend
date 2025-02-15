const Golive = require('../models/professionalGoLive.model'); // Import the Golive model
const ProfessionalService = require('../models/professionalServices.model'); // Import the Professionalservices model

// CREATE: Add a new event
exports.addNewEvent = async (req, res) => {
  try {
    const { ServiceId, eventTitle, description, date, time, eventType, price } = req.body;

    // Validate ServiceId exists in the Professionalservices collection
    const serviceExists = await ProfessionalService.findById(ServiceId);
    if (!serviceExists) {
      return res.status(400).json({ message: 'Invalid ServiceId. Service does not exist.' });
    }

    // Validate required fields
    if (!eventTitle || !time) {
      return res.status(400).json({ message: 'Event title and time are required fields.' });
    }

    // Validate eventType enum
    if (eventType && !['paid event', 'free event'].includes(eventType)) {
      return res.status(400).json({ message: 'Invalid eventType. Must be "paid event" or "free event".' });
    }

    // If eventType is "paid event", price must be provided
    if (eventType === 'paid event' && !price) {
      return res.status(400).json({ message: 'Price is required for paid events.' });
    }

    // Create the new event
    const newEvent = new Golive({
      ServiceId,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price,
    });

    // Save the event to the database
    await newEvent.save();

    return res.status(201).json({ message: 'Event added successfully.', event: newEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// READ: Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Golive.find().populate('ServiceId', 'name'); // Populate ServiceId with relevant fields
    return res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// READ: Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Golive.findById(id).populate('ServiceId', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.status(200).json({ event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// UPDATE: Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate eventType enum if provided
    if (updates.eventType && !['paid event', 'free event'].includes(updates.eventType)) {
      return res.status(400).json({ message: 'Invalid eventType. Must be "paid event" or "free event".' });
    }

    // If eventType is updated to "paid event", ensure price is provided
    if (updates.eventType === 'paid event' && !updates.price) {
      return res.status(400).json({ message: 'Price is required for paid events.' });
    }

    // Find and update the event
    const updatedEvent = await Golive.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE: Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the event
    const deletedEvent = await Golive.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.status(200).json({ message: 'Event deleted successfully.', event: deletedEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};