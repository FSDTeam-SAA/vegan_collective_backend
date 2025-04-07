const OrganizationVolunteer = require("../models/organizationvolunteer.model");
const Organizationeventmanagement = require("../models/organizationEventManagement.model");

const createVolunteer = async (req, res) => {
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

    // Check if userID is provided when required
    if (event.requiresUser && !attendeeDetail.userID) {
      return res.status(400).json({
        success: false,
        message: "User ID is required for this event",
      });
    }

    // Create a new volunteer with the attendeeDetail including userID
    const newVolunteer = new OrganizationVolunteer({
      organizationEventID,
      attendeeDetail: {
        ...attendeeDetail, // Spread the existing attendeeDetail
        userID: attendeeDetail.userID, // Ensure userID is included
        skillAndExperience: attendeeDetail.skillAndExperience, // Include volunteer-specific fields
        motivationalStatement: attendeeDetail.motivationalStatement,
      },
    });

    // Save the volunteer to the database
    const savedVolunteer = await newVolunteer.save();

    // Increment the Attendees count in the corresponding event
    event.Attendees += 1;
    await event.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "Volunteer created successfully",
      data: savedVolunteer,
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      success: false,
      message: "Error creating volunteer",
      error: error.message,
    });
  }
};

const getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Fetch volunteers with pagination
    const volunteers = await OrganizationVolunteer.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("organizationEventID", "eventTitle eventType price Attendees date time") // Populate event details
      .exec();

    // Count total documents for pagination
    const totalItems = await OrganizationVolunteer.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Prepare response
    res.status(200).json({
      success: true,
      message: "Volunteers fetched successfully",
      data: volunteers,
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
      message: "Error fetching volunteers",
      error: error.message,
    });
  }
};


const getVolunteersByEventId = async (req, res) => {
    try {
      const { eventId } = req.params;
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided
  
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
  
      // Find total volunteers count for the event
      const totalVolunteers = await OrganizationVolunteer.countDocuments({
        organizationEventID: eventId,
      });
  
      // Find volunteers by event ID with pagination
      const volunteers = await OrganizationVolunteer.find(
        { organizationEventID: eventId },
        { attendeeDetail: 1, createdAt: 1 } // Include only `attendeeDetail` and `createdAt`
      )
        .populate("organizationEventID", "eventTitle eventType price Attendees date time") // Populate event details
        .skip(skip)
        .limit(limit)
        .exec();
  
      // Flatten all attendeeDetail arrays into a single array and include `createdAt`
      const flattenedAttendeeDetails = volunteers.flatMap((volunteer) =>
        volunteer.attendeeDetail.map((attendee) => ({
          ...attendee.toObject(), // Convert Mongoose subdocument to plain object
          createdAt: volunteer.createdAt, // Add `createdAt` from the volunteer
        }))
      );
  
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalVolunteers / limit);
      const metaPagination = {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalVolunteers,
        itemsPerPage: limit,
      };
  
      // Return the flattened array and pagination metadata in the response
      res.status(200).json({
        success: true,
        message:
          flattenedAttendeeDetails.length > 0
            ? "Volunteers fetched successfully"
            : "No volunteers found for this event",
        data: flattenedAttendeeDetails, // Single array of all attendeeDetails with `createdAt`
        pagination: metaPagination, // Pagination metadata
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching volunteers",
        error: error.message,
      });
    }
  };

module.exports = {
  createVolunteer,
  getAllVolunteers,
  getVolunteersByEventId,
};