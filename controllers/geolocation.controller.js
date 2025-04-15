const mongoose = require('mongoose');
const User = mongoose.model('User');
const Professionalinfo = mongoose.model('Professionalinfo');
const Merchantinfo = mongoose.model('Merchantinfo');
const Organizationinfo = mongoose.model('Organizationinfo');

const updateUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { country, state, city } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { country, state, city },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('country state city');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorsByLocation = async (req, res) => {
  try {
    const { country, state, city } = req.query;
    
    // Build location filter
    const locationFilter = {};
    if (country) locationFilter.country = country;
    if (state) locationFilter.state = state;
    if (city) locationFilter.city = city;

    // Find vendors with matching location
    const vendors = await User.find({
      role: ["user", "vendor", "verifier"],
      ...locationFilter
    });

    // Get details from each vendor's info model
    const vendorDetails = await Promise.all(vendors.map(async (vendor) => {
      let vendorInfo = null;
      
      // Check each info model
      const professionalInfo = await Professionalinfo.findOne({ userId: vendor._id });
      if (professionalInfo) {
        vendorInfo = professionalInfo;
        vendorInfo.type = 'professional';
        return vendorInfo;
      }
      
      const merchantInfo = await Merchantinfo.findOne({ userID: vendor._id });
      if (merchantInfo) {
        vendorInfo = merchantInfo;
        vendorInfo.type = 'merchant';
        return vendorInfo;
      }
      
      const organizationInfo = await Organizationinfo.findOne({ userID: vendor._id });
      if (organizationInfo) {
        vendorInfo = organizationInfo;
        vendorInfo.type = 'organization';
        return vendorInfo;
      }
      
      return null;
    }));

    // Filter out nulls and return
    res.status(200).json({
      success: true,
      message: "Vendors retrieved successfully",
      data: vendorDetails.filter(detail => detail !== null)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  updateUserLocation,
  getUserLocation,
  getVendorsByLocation
};
