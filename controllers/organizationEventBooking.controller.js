const Organizationeventbooking = require("../models/organizationEventBooking.model");
const Organizationeventmanagement = require("../models/organizationEventManagement.model");

// Create a new booking and update Attendees count
const createBooking = async (req, res) => {
  try {
    const { organizationEventID, attendeeDetail } = req.body;

    // Check if the event exists
    const event = await Organizationeventmanagement.findById(organizationEventID);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Create a new booking
    const newBooking = new Organizationeventbooking({
      organizationEventID,
      attendeeDetail,
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Increment the Attendees count in the corresponding event
    event.Attendees += 1;
    await event.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking,
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Get all bookings with pagination
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Fetch bookings with pagination
    const bookings = await Organizationeventbooking.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("organizationEventID", "eventTitle eventType price Attendees date time") // Populate event details
      .exec();

    // Count total documents for pagination
    const totalItems = await Organizationeventbooking.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Prepare response
    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
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
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

//get by id
const getBookingsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find bookings by event ID
    const bookings = await Organizationeventbooking.find({ organizationEventID: eventId })
      .populate("organizationEventID", "eventTitle eventType price Attendees date time")
      .exec();

    // Flatten all attendeeDetail arrays into a single array
    const flattenedAttendeeDetails = bookings.flatMap((booking) => booking.attendeeDetail);

    // Return the flattened array in the response
    res.status(200).json({
      success: true,
      message: flattenedAttendeeDetails.length > 0 ? "Bookings fetched successfully" : "No bookings found for this event",
      data: flattenedAttendeeDetails, // Single array of all attendeeDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};


module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByEventId, // Add the new function
};
