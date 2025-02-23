const Organizationeventmanagement = require("../models/organizationEventManagement.model");

// Add a new event
const addEvent = async (req, res) => {
  try {
      const {
          organizationID,
          eventTitle,
          description,
          date,
          time,
          paymentType,
          price,
          eventType,
          eventCategory,
          capacity,
      } = req.body;

      // Ensure price is only removed for "free event"
      const eventPrice = eventType === "free event" ? null : price;

      // Create a new event
      const newEvent = new Organizationeventmanagement({
          organizationID,
          eventTitle,
          description,
          date,
          time,
          paymentType,
          price: eventPrice,
          eventType,
          eventCategory,
          capacity,
      });

      // Save the event to the database
      await newEvent.save();

      // Send success response
      res.status(201).json({
          success: true,
          message: "Event added successfully",
          data: newEvent,
      });
  } catch (error) {
      res.status(400).json({
          success: false,
          message: "Error adding event",
          error: error.message,
      });
  }
};


// Get all events with pagination, search, and filtering
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", eventType } = req.query;

    // Build the query object
    const query = {};
    if (search) {
      query.eventTitle = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    if (eventType) {
      query.eventType = eventType; // Filter by event type
    }

    // Fetch events with pagination
    const events = await Organizationeventmanagement.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Count total documents for pagination
    const totalItems = await Organizationeventmanagement.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Prepare response
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// Get an event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by ID
    const event = await Organizationeventmanagement.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Set price to null for free and volunteer events
    if (updateData.eventType === "free event" || updateData.eventType === "volunteer event") {
      updateData.price = null;
    }

    // Find and update the event
    const updatedEvent = await Organizationeventmanagement.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find and delete the event
    const deletedEvent = await Organizationeventmanagement.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

//get all events with pagination// Get all events with pagination, search, and filtering
const getAllEvents = async (req, res) => {
  try {
    // Extract query parameters
    const { page = 1, limit = 10, search = "", eventType } = req.query;

    // Build the query object
    const query = {};
    if (search) {
      query.eventTitle = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    if (eventType) {
      query.eventType = eventType; // Filter by event type
    }

    // Fetch events with pagination
    const events = await Organizationeventmanagement.find(query)
      .limit(limit * 1) // Limit the number of results per page
      .skip((page - 1) * limit) // Skip results based on the current page
      .exec();

    // Count total documents for pagination
    const totalItems = await Organizationeventmanagement.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Prepare response
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};  

module.exports = {
  addEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
};