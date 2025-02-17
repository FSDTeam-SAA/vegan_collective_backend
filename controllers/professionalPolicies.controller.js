const ProfessionalPolicy = require('../models/professionalPolicies.model');
const User = require('../models/user.model'); // Assuming you have a User model

// Create a new professional policy
exports.createProfessionalPolicy = async (req, res) => {
  try {
    const { userID, beforeAppointment, afterAppointment, cancellationWindow, noShowPolicy } = req.body;

    // Check if the user exists
    const userExists = await User.findById(userID);
    if (!userExists) {
      return res.status(400).json({ message: 'Invalid userID. User does not exist.' });
    }

    // Create the professional policy
    const newPolicy = new ProfessionalPolicy({
      userID,
      beforeAppointment,
      afterAppointment,
      cancellationWindow,
      noShowPolicy,
    });

    const savedPolicy = await newPolicy.save();
    res.status(201).json(savedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all professional policies
exports.getAllProfessionalPolicies = async (req, res) => {
  try {
    const policies = await ProfessionalPolicy.find().populate('userID', 'name email'); // Populate user details
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single professional policy by ID
exports.getProfessionalPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await ProfessionalPolicy.findById(id).populate('userID', 'name email');

    if (!policy) {
      return res.status(404).json({ message: 'Professional policy not found' });
    }

    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a professional policy
exports.updateProfessionalPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { userID, beforeAppointment, afterAppointment, cancellationWindow, noShowPolicy } = req.body;

    // Check if the user exists
    if (userID) {
      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(400).json({ message: 'Invalid userID. User does not exist.' });
      }
    }

    const updatedPolicy = await ProfessionalPolicy.findByIdAndUpdate(
      id,
      { userID, beforeAppointment, afterAppointment, cancellationWindow, noShowPolicy },
      { new: true, runValidators: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Professional policy not found' });
    }

    res.status(200).json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a professional policy
exports.deleteProfessionalPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPolicy = await ProfessionalPolicy.findByIdAndDelete(id);

    if (!deletedPolicy) {
      return res.status(404).json({ message: 'Professional policy not found' });
    }

    res.status(200).json({ message: 'Professional policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};