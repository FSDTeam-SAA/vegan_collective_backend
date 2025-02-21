const MerchantPolicy = require('../models/merchantPolicies.model')
const User = require('../models/user.model')

// Create a new Merchant Policy
exports.createPolicy = async (req, res) => {
  try {
    const { merchantID } = req.body

    // Check if merchantID exists in the User collection
    const merchantExists = await User.findById(merchantID)
    if (!merchantExists) {
      return res.status(400).json({ success: false, error: 'Invalid merchant ID' })
    }

    const policy = new MerchantPolicy(req.body)
    await policy.save()
    res.status(201).json({ success: true, data: policy })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// Get all Merchant Policies
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await MerchantPolicy.find().populate('merchantID')
    res.status(200).json({ success: true, data: policies })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get a single Merchant Policy by ID
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await MerchantPolicy.findById(req.params.id).populate('merchantID')
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' })
    }
    res.status(200).json({ success: true, data: policy })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Update a Merchant Policy by ID
// Update a Merchant Policy by ID
exports.updatePolicy = async (req, res) => {
    try {
      const { merchantID } = req.body;
  
      if (merchantID) {
        const merchantExists = await User.findById(merchantID);
        if (!merchantExists) {
          return res.status(400).json({ success: false, error: 'Invalid merchant ID' });
        }
      }
  
      const policy = await MerchantPolicy.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true } // Ensures the latest data and applies validation
      );
  
      if (!policy) {
        return res.status(404).json({ success: false, message: 'Policy not found' });
      }
  
      res.status(200).json({ success: true, data: policy });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
  

// Delete a Merchant Policy by ID
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await MerchantPolicy.findByIdAndDelete(req.params.id)
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' })
    }
    res.status(200).json({ success: true, message: 'Policy deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
