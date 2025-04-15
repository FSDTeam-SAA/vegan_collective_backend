const MerchantCustomerManagement = require('../models/merchantCustomerManagement.model');
const mongoose = require('mongoose');
const Userpayment = require('../models/userPayment.model')
const MerchantProducts = require('../models/merchantProducts.model')
const Merchantinfo = require('../models/merchantInfo.model')


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
// exports.getCustomerById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid ID' });
//     }


//     const customer = await MerchantCustomerManagement.findById(id);

//     if (!customer) {
//       return res.status(404).json({ success: false, message: 'Customer not found' });
//     }

//     // Wrap data in an array
//     res.status(200).json({ 
//       success: true, 
//       message: 'Customer fetched successfully', 
//       data: { customer } // Ensure data is an array
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getCustomerByMerchantID = async (req, res) => {
  try {
    const { merchantID } = req.params;

    // Validate merchantID
    if (!mongoose.Types.ObjectId.isValid(merchantID)) {
      return res.status(400).json({ success: false, message: 'Invalid merchantID' });
    }

    // Find a single customer for the given merchantID
    const customer = await MerchantCustomerManagement.findOne({ merchantID });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'No customer found for this merchantID' });
    }

    // Return the single customer object
    res.status(200).json({ 
      success: true, 
      message: 'Customer retrieved successfully', 
      data: customer 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, whatsApp, messenger } = req.body;  
    const updatedCustomer = await MerchantCustomerManagement.findByIdAndUpdate(
      id,
      { email, whatsApp, messenger },
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: [updatedCustomer]
    });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
}






//delete customer by id
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


// customer order product  management
exports.customerOrderProductData = async (req, res) => {
  try {
    const { userID, page = 1, limit = 10 } = req.query

    if (!userID) {
      return res
        .status(400)
        .json({ success: false, message: 'userID is required' })
    }

    // Fetch orders with pagination, sorted by createdAt descending
    const orders = await Userpayment.find({ userID, sellerType: 'Merchant' })
      .populate('productId') // Populate product details
      .populate({ path: 'sellerID', model: 'Merchantinfo' }) // Populate seller details from Merchantinfo
      .sort({ createdAt: -1 }) // Newest orders first
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: 'No orders found for this user.',
        data: [],
      });
    }

    // Generate Order Numbers dynamically
    const formattedOrders = orders.map((order, index) => ({
      ...order._doc,
      orderNumber: `ORD-${String(index + 1).padStart(3, '0')}`, // ORD-001, ORD-002, etc.
      shippingStatus: 'Pending', // Default to Pending
    }))

    // Pagination metadata
    const totalOrders = await Userpayment.countDocuments({
      userID,
      sellerType: 'Merchant',
    })
    const totalPages = Math.ceil(totalOrders / limit)

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalOrders,
        itemsPerPage: parseInt(limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
