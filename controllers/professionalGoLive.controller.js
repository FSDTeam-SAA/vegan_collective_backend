const mongoose = require('mongoose');
const Golive = require('../models/professionalGoLive.model'); // Adjust the path as needed
const User = require('../models/user.model'); // Adjust the path as needed

// Create a new GoLive event
exports.createGoLiveEvent = async (req, res) => {
  try {
    const { userID, eventTitle, description, date, time, eventType, price } = req.body;

    // Validate if userID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userID format",
      });
    }

    // Check if the user exists and has an account type of "professional"
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.accountType !== "professional") {
      return res.status(403).json({
        success: false,
        message: "This user is not a professional",
      });
    }

    // Create the GoLive event
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
    res.status(201).json({
      success: true,
      message: "GoLive event created successfully",
      data: savedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all GoLive events (publicly accessible)
exports.getAllGoLiveEvents = async (req, res) => {
  try {
    // Fetch all GoLive events from the database
    const events = await Golive.find();
    res.status(200).json({
      success: true,
      message: "All GoLive events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all GoLive events created by a specific user
exports.getGoLiveEventsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if event ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Fetch GoLive event by ID
    const event = await Golive.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "GoLive event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "GoLive event fetched successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// Update a GoLive event by ID
exports.updateGoLiveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventTitle, description, date, time, eventType, price } = req.body;

    // Validate if the event ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Find and update the event
    const updatedEvent = await Golive.findByIdAndUpdate(
      id,
      { eventTitle, description, date, time, eventType, price },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "GoLive event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "GoLive event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a GoLive event by ID
exports.deleteGoLiveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the event ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Find and delete the event
    const deletedEvent = await Golive.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "GoLive event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "GoLive event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};