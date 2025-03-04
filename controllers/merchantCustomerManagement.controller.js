const MerchantCustomerManagement = require('../models/merchantCustomerManagement.model');
const mongoose = require('mongoose');

// Create a new customer entry
exports.createCustomer = async (req, res) => {
  try {
    const { merchantID, email, whatsApp, messenger } = req.body;

    // Validate merchantID
    if (!mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ success: false, message: 'Invalid merchantID' });
    }

    const newCustomer = new MerchantCustomerManagement({
      merchantID,
      email,
      whatsApp,
      messenger,
    });

    await newCustomer.save();

    // Wrap data in an array
    res.status(201).json({ 
      success: true, 
      message: 'Customer created successfully', 
      data: [newCustomer] // Ensure data is an array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Fetch customers with only the desired fields
    const customers = await MerchantCustomerManagement.find()
  
      .select('email whatsApp messenger createdAt updatedAt __v'); // Select specific fields

    // Wrap data in an array (already an array, but ensuring consistency)
    res.status(200).json({
      success: true,
      message: 'Customers fetched successfully',
      data: customers, // Already an array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }


    const customer = await MerchantCustomerManagement.findById(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Wrap data in an array
    res.status(200).json({ 
      success: true, 
      message: 'Customer fetched successfully', 
      data: { customer } // Ensure data is an array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchantID, email, whatsApp, messenger } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    // Validate merchantID
    if (merchantID && !mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ success: false, message: 'Invalid merchantID' });
    }

    const updatedCustomer = await MerchantCustomerManagement.findByIdAndUpdate(
      id,
      {  email, whatsApp, messenger },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Wrap data in an array
    res.status(200).json({ 
      success: true, 
      message: 'Customer updated successfully', 
      data: {updatedCustomer}// Ensure data is an array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const deletedCustomer = await MerchantCustomerManagement.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // No data to return for deletion, but still include an empty array for consistency
    res.status(200).json({ 
      success: true, 
      message: 'Customer deleted successfully', 
      data: [] // Empty array for consistency
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};