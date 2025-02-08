const Professionalhelpandsupport = require('../models/professionalHelpAndSupport.model');
const Professionalinfo = require('../models/professionalInfo.model'); 
const mongoose = require('mongoose');

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { user, subject, message } = req.body;

    // Validate required fields
    if (!user || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "User, subject, and message are required fields.",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    // Check if user exists in Professionalinfo
    const existingUser = await Professionalinfo.findOne({ user });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "The provided user ID is not associated with a valid Professionalinfo record.",
      });
    }

    // Generate a unique slug "TICK-XXX"
    let slug;
    let slugExists = true;

    while (slugExists) {
      const randomDigits = Math.floor(100 + Math.random() * 900);
      slug = `TICK-${randomDigits}`;
      const existingTicket = await Professionalhelpandsupport.findOne({ slug });
      slugExists = !!existingTicket;
    }

    // Create a new ticket
    const newTicket = new Professionalhelpandsupport({
      user: existingUser._id, // Store Professionalinfo ID
      slug,
      subject,
      message,
      status: "pending",
    });

    await newTicket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      data: newTicket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get all support tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Professionalhelpandsupport.find().populate({
      path: "user",
      select: "_id user organizationName verificationStatus" // Only necessary fields
    });

    res.status(200).json({
      success: true,
      message: "Tickets retrieved successfully.",
      data: tickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get a single support ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format.",
      });
    }

    const ticket = await Professionalhelpandsupport.findById(ticketId).populate({
      path: "user",
      select: "_id user organizationName verificationStatus"
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket retrieved successfully.",
      data: ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update a support ticket's status
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format.",
      });
    }

    // Validate status
    const validStatuses = ["resolved", "in progress", "pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: resolved, in progress, pending.",
      });
    }

    const updatedTicket = await Professionalhelpandsupport.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully.",
      data: updatedTicket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete a support ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format.",
      });
    }

    const deletedTicket = await Professionalhelpandsupport.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
