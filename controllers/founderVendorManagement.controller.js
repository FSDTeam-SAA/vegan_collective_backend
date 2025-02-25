const Vendor = require('../models/founderVendorManagement.model');

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('professionalInfo')
      .populate('merchantInfo')
      .populate('organizationInfo');
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error });
  }
};

// Get vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('professionalInfo')
      .populate('merchantInfo')
      .populate('organizationInfo');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor', error });
  }
};

// Create a new vendor
exports.createVendor = async (req, res) => {
  try {
    const { businessName, type, professionalInfo, merchantInfo, organizationInfo } = req.body;
    const newVendor = new Vendor({
      businessName,
      type,
      professionalInfo,
      merchantInfo,
      organizationInfo,
    });
    const savedVendor = await newVendor.save();
    res.status(201).json(savedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vendor', error });
  }
};

// Update vendor status
exports.updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vendor status', error });
  }
};

// Delete a vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vendor', error });
  }
};