
const User = require('../models/user.model');
const Usersupport = require('../models/userSupport.model');

async function generateTicketSlug() {
    const lastTicket = await Usersupport.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastTicket) return 'TICK-001'; // If no tickets exist, start with TICK-001
  
    const lastNumber = parseInt(lastTicket.ticketSlug.split('-')[1], 10);
    const newNumber = lastNumber + 1;
    return `TICK-${String(newNumber).padStart(3, '0')}`;
  }

const userCreateSupport = async (req, res) => {
    try {
      const { userID, subject, description } = req.body;
  
      // Validate user ID and check if the user exists and is professional
      const user = await User.findById(userID);
      if (!user || user.role !== 'user') {
        return res.status(400).json({ error: 'Invalid user ID or account type' });
      }
  
      // Generate ticketSlug
      const ticketSlug = await generateTicketSlug();
      const userName = user.fullName;
      const userEmail = user.email;
  
      // Create the support ticket
      const newTicket = new Usersupport({
        userID,
        ticketSlug,
        name : userName,
        email : userEmail,
        subject,
        description,
        status: 'pending', // Default status
      });
  
      await newTicket.save();
      return res.status(201).json({ 
        success: true,
        message: 'Support ticket created successfully', 
        ticket: newTicket 
    });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        error: 'Server error', 
        details: error.message 
    });
    }
  };

  module.exports = userCreateSupport;