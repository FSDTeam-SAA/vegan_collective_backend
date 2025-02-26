const mongoose = require('mongoose');
const Support = require('../models/support.model'); // Adjust the path as needed
const User = require('../models/user.model'); // Assuming you have a User model

// Helper function to generate sequential ticketSlug (TICK-001, TICK-002, etc.)
async function generateTicketSlug() {
  const lastTicket = await Support.findOne({}, {}, { sort: { createdAt: -1 } });
  if (!lastTicket) return 'TICK-001'; // If no tickets exist, start with TICK-001
  const lastNumber = parseInt(lastTicket.ticketSlug.split('-')[1], 10);
  const newNumber = lastNumber + 1;
  return `TICK-${String(newNumber).padStart(3, '0')}`;
}

// Create a new support ticket

exports.createSupportTicket = async (req, res) => {
  try {
    const { professionalID, subject, message } = req.body;

    // Validate professionalID format
    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional ID format',
      });
    }

    // Check if the user exists and is a professional
    const user = await User.findById(professionalID);
    if (!user || user.accountType !== 'professional') {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional ID or account type is not professional',
      });
    }

    // Generate a sequential ticketSlug
    const ticketSlug = await generateTicketSlug();

    // Create a new support ticket
    const newTicket = new Support({
      professionalID,
      ticketSlug,
      subject,
      message,
      status: 'pending',
    });

    // Save the ticket to the database
    await newTicket.save();

    // Include professionalID in the response
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        ticketSlug: newTicket.ticketSlug,
        subject: newTicket.subject,
        message: newTicket.message,
        status: newTicket.status,
        professionalID: newTicket.professionalID, // Include professionalID here
        _id: newTicket._id,
        createdAt: newTicket.createdAt,
        updatedAt: newTicket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: error.message,
    });
  }
};

// Get all support tickets
exports.getAllSupportTickets = async (req, res) => {
  try {
    // Fetch all tickets and exclude only the userID field
    const tickets = await Support.find({}, { professionalID: 0 }) // Exclude only professionalID field
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      tickets,
    });
  } catch (error) {
    console.error('Error fetching all support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: error.message,
    });
  }
};

// Get support tickets by professionalID
exports.getSupportTicketsByProfessionalID = async (req, res) => {
  try {
    const { professionalID } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(professionalID)) {
      return res.status(400).json({ success: false, message: 'Invalid professional ID format' });
    }

    // Convert professionalID to ObjectId
    const tickets = await Support.find(
      { professionalID: new mongoose.Types.ObjectId(professionalID) }
    ).sort({ createdAt: -1 });

    if (!tickets.length) {
      return res.status(404).json({ success: false, message: 'No support tickets found for this professional' });
    }

    res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      tickets,
    });
  } catch (error) {
    console.error('Error fetching support tickets by professional ID:', error);
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};


// Get support ticket by ID
exports.getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the ticket by ID and exclude _id and professionalID fields
    const ticket = await Support.findById(id, { _id: 0, professionalID: 0 }); // Exclude _id and professionalID fields
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Support ticket retrieved successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error fetching support ticket by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: error.message,
    });
  }
};

// Update support ticket by ID
exports.updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, status } = req.body;

    // Update the ticket
    const updatedTicket = await Support.findByIdAndUpdate(
      id,
      { subject, message, status },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: error.message,
    });
  }
};

// Delete support ticket by ID
exports.deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the ticket
    const deletedTicket = await Support.findByIdAndDelete(id);
    if (!deletedTicket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Support ticket deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: error.message,
    });
  }
};