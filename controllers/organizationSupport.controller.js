const Organizationsupport = require('../models/organizationSupport.model');

// Create a new support ticket
exports.createSupportTicket = async (req, res) => {
  try {
    const { organizationID, name, emailAddress, subject, message, status } = req.body;

    // Find the last ticket to determine the next ticket number
    const lastTicket = await Organizationsupport.findOne({ organizationID })
      .sort({ ticketSlug: -1 }) // Sort in descending order to get the latest ticket
      .exec();

    let ticketNumber = 1; // Default ticket number if no tickets exist yet

    if (lastTicket && lastTicket.ticketSlug) {
      // Extract the number from the last ticket's ticketSlug and increment it
      const lastTicketNumber = parseInt(lastTicket.ticketSlug.split('-')[1], 10);
      ticketNumber = lastTicketNumber + 1;
    }

    // Generate the new ticketSlug
    const ticketSlug = `TICK-${String(ticketNumber).padStart(3, '0')}`;

    // Create the new support ticket
    const newSupportTicket = new Organizationsupport({
      organizationID,
      ticketSlug,
      name,
      emailAddress,
      subject,
      message,
      status,
    });

    // Save the new ticket to the database
    const savedTicket = await newSupportTicket.save();

    // Respond with the saved ticket
    res.status(201).json({ success: true, message: 'Support ticket created successfully', data: savedTicket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all support tickets
exports.getAllSupportTickets = async (req, res) => {
try {
  const tickets = await Organizationsupport.find().populate('organizationID');
  res.status(200).json({ success: true, message: 'Support tickets retrieved successfully', data: tickets });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};

// Get a single support ticket by ID
exports.getSupportTicketById = async (req, res) => {
try {
  const ticket = await Organizationsupport.findById(req.params.id).populate('organizationID');
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Support ticket not found' });
  }
  res.status(200).json({ success: true, message: 'Support ticket retrieved successfully', data: ticket });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};

// Update a support ticket by ID
exports.updateSupportTicket = async (req, res) => {
try {
  const { organizationID, ticketSlug, name, emailAddress, subject, message, status } = req.body;
  const updatedTicket = await Organizationsupport.findByIdAndUpdate(
    req.params.id,
    {
      organizationID,
      ticketSlug,
      name,
      emailAddress,
      subject,
      message,
      status,
    },
    { new: true }
  );
  if (!updatedTicket) {
    return res.status(404).json({ success: false, message: 'Support ticket not found' });
  }
  res.status(200).json({ success: true, message: 'Support ticket updated successfully', data: updatedTicket });
} catch (error) {
  res.status(400).json({ success: false, message: error.message });
}
};

// Delete a support ticket by ID
exports.deleteSupportTicket = async (req, res) => {
try {
  const deletedTicket = await Organizationsupport.findByIdAndDelete(req.params.id);
  if (!deletedTicket) {
    return res.status(404).json({ success: false, message: 'Support ticket not found' });
  }
  res.status(200).json({ success: true, message: 'Support ticket deleted successfully' });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};