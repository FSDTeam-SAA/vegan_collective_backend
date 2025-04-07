const Usersupport = require('../models/userSupport.model'); // Adjust the path as necessary
const mongoose = require('mongoose');

// Helper function to generate ticket slug
const generateTicketSlug = async () => {
  const count = await Usersupport.countDocuments();
  return `TICK-${String(count + 1).padStart(3, '0')}`;
};

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { userID, name, email, subject, description } = req.body;

    // Validate required fields
    if (!userID || !name || !email || !subject || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Generate ticket slug
    const ticketSlug = await generateTicketSlug();

    // Create new ticket
    const newTicket = new Usersupport({
      userID,
      name,
      email,
      subject,
      description,
      ticketSlug,
    });

    // Save the ticket to the database
    const savedTicket = await newTicket.save();

    // Return the response with the created ticket data
    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: savedTicket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all tickets with pagination
exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const totalItems = await Usersupport.countDocuments();
    const tickets = await Usersupport.find()
      .populate('userID', 'name email')
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    };

    res.status(200).json({ success: true, tickets, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const ticket = await Usersupport.findById(id).populate('userID', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a ticket by ID
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, status, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const ticket = await Usersupport.findByIdAndUpdate(
      id,
      { name, email, subject, status, description },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, message: "Ticket updated successfully", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a ticket by ID
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const ticket = await Usersupport.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all tickets by user ID with pagination
exports.getTicketsByUserId = async (req, res) => {
  try {
    const { userID } = req.params; // Extract userID from request parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Validate userID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Count total tickets for the given user
    const totalItems = await Usersupport.countDocuments({ userID });

    // Fetch tickets for the given user with pagination
    const tickets = await Usersupport.find({ userID })
      .populate('userID', 'name email') // Populate user details if needed
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    };

    // Return the response with tickets and pagination metadata
    res.status(200).json({
      success: true,
      tickets,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};