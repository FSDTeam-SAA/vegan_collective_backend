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
    const { userID, subject, message } = req.body;

    // Validate user ID and check if the user exists and is professional
    const user = await User.findById(userID);
    if (!user || user.accountType !== 'professional') {
      return res.status(400).json({ success: false, message: 'Invalid user ID or account type is not professional' });
    }

    // Generate ticketSlug
    const ticketSlug = await generateTicketSlug();

    // Create the support ticket
    const newTicket = new Support({
      userID,
      ticketSlug,
      subject,
      message,
      status: 'pending', // Default status
    });

    await newTicket.save();
    res.status(201).json({ success: true, message: 'Support ticket created successfully', ticket: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

// Get all support tickets
exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await Support.find().populate('userID', 'name email accountType');
    res.status(200).json({ success: true, message: 'Support tickets retrieved successfully', tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

// Get support ticket by ID
exports.getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Support.findById(id).populate('userID', 'name email accountType');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({ success: true, message: 'Support ticket retrieved successfully', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

// Update support ticket by ID
exports.updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, status } = req.body;

    const updatedTicket = await Support.findByIdAndUpdate(
      id,
      { subject, message, status },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({ success: true, message: 'Support ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

// Delete support ticket by ID
exports.deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTicket = await Support.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({ success: true, message: 'Support ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};