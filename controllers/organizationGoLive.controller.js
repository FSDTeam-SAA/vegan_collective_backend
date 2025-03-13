const mongoose = require("mongoose");
const Organizationgolive = require("../models/organizationGoLive.model");

// Helper function to determine event status
const getEventStatus = (eventDate) => {
  const today = new Date();
  const eventDateTime = new Date(eventDate);

  if (eventDateTime > today) {
    return "upcoming";
  } else {
    return "past";
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const {
      organizationID,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price,
    } = req.body;

    // Determine event status
    const eventStatus = getEventStatus(`${date}T${time}`);

    // Create the event
    const newEvent = await Organizationgolive.create({
      organizationID,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price,
      eventStatus, // Add event status to the document
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get events based on type  and organizationID
// exports.getEvents = async (req, res) => {
//   try {
//     const { type, organizationID } = req.query;

//     // Validate query parameters
//     if (!type || !["paid event", "free event"].includes(type)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or missing 'type' parameter. Must be 'paid event' or 'free event'.",
//       });
//     }

//     if (!organizationID) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing 'organizationID' parameter.",
//       });
//     }

//     // Fetch events based on type and organizationID
//     const today = new Date();
//     const query = {
//       organizationID: new mongoose.Types.ObjectId(organizationID),
//     };

//     if (type === "paid event") {
//       query.date = { $gte: today.toISOString().split("T")[0] }; // Events with date >= today
//     } else if (type === "free event") {
//       query.date = { $lt: today.toISOString().split("T")[0] }; // Events with date < today
//     }

//     const events = await Organizationgolive.find(query);

//     res.status(200).json({
//       success: true,
//       message: `Fetched ${type} events successfully.`,
//       data: events,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// };

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
      }
  
      // Find the event by ID
      const event = await Organizationgolive.findById(id);
  
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Event fetched successfully.",
        data: event,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };
  
  // Update event by ID
  exports.updateEvent = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
      }
  
      // Find and update the event
      const updatedEvent = await Organizationgolive.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true } // Return the updated document and run validation
      );
  
      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Event updated successfully.",
        data: updatedEvent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };
  
  // Delete event by ID
  exports.deleteEvent = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
      }
  
      // Find and delete the event
      const deletedEvent = await Organizationgolive.findByIdAndDelete(id);
  
      if (!deletedEvent) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Event deleted successfully.",
        data: deletedEvent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };

  // Get events by organizationID and eventType
// Get events by organizationID and eventType (paid/free)
exports.getEventsByOrganizationAndType = async (req, res) => {
  try {
    const { organizationID, eventtype } = req.query;

    // Validate query parameters
    if (!organizationID) {
      return res.status(400).json({
        success: false,
        message: "Missing 'organizationID' parameter.",
      });
    }

    if (!eventtype || !["paid event", "free event"].includes(eventtype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'eventtype' parameter. Must be 'paid event' or 'free event'.",
      });
    }

    // Fetch events based on organizationID and eventType
    const query = {
      organizationID: new mongoose.Types.ObjectId(organizationID),
      eventType: eventtype,
    };

    const events = await Organizationgolive.find(query);

    res.status(200).json({
      success: true,
      message: `Fetched ${eventtype} events successfully.`,
      data: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get all events by organizationID
exports.getEventsByOrganizationgolive = async (req, res) => {
  try {
    const { organizationID } = req.query;

    // Validate query parameter
    if (!organizationID) {
      return res.status(400).json({
        success: false,
        message: "Missing 'organizationID' parameter.",
      });
    }

    // Fetch all events for the organization
    const query = {
      organizationID: new mongoose.Types.ObjectId(organizationID),
    };

    const events = await Organizationgolive.find(query);

    res.status(200).json({
      success: true,
      message: "Fetched all events for the organization successfully.",
      data: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
