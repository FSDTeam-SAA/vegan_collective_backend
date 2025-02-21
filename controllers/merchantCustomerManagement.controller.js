const MerchantCustomerManagement = require('../models/merchantCustomerManagement.model');
const mongoose = require('mongoose');

// Create a new customer entry
exports.createCustomer = async (req, res) => {
  try {
    const { merchantID, email, whatsApp, messenger } = req.body;
    // Validate merchantID
    if (!mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ status: false, message: 'Invalid merchantID' });
    }
    const newCustomer = new MerchantCustomerManagement({
      merchantID,
      email,
      whatsApp,
      messenger,
    });
    await newCustomer.save();
    res.status(201).json({ status: true, data: newCustomer });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await MerchantCustomerManagement.find().populate('merchantID', 'name email');
    res.status(200).json({ status: true, data: customers });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID' });
    }
    const customer = await MerchantCustomerManagement.findById(id).populate('merchantID', 'name email');
    if (!customer) {
      return res.status(404).json({ status: false, message: 'Customer not found' });
    }
    res.status(200).json({ status: true, data: customer });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchantID, email, whatsApp, messenger } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID' });
    }
    if (merchantID && !mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ status: false, message: 'Invalid merchantID' });
    }
    const updatedCustomer = await MerchantCustomerManagement.findByIdAndUpdate(
      id,
      { merchantID, email, whatsApp, messenger },
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ status: false, message: 'Customer not found' });
    }
    res.status(200).json({ status: true, data: updatedCustomer });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID' });
    }
    const deletedCustomer = await MerchantCustomerManagement.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ status: false, message: 'Customer not found' });
    }
    res.status(200).json({ status: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};