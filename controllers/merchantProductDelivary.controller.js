const Merchantproductdelivary = require("../models/merchantProductDelivary.model");
const User = require("../models/user.model");
const Merchantsalesmanagement = require("../models/merchantSalesManagement.model");

// Create a new delivery record
exports.createDelivery = async (req, res) => {
  try {
    const { merchantID, orderDetail, trackingNumber, shipping } = req.body;

    // Validate merchantID
    const merchantExists = await User.findById(merchantID);
    if (!merchantExists) {
      return res.status(400).json({ success: false, message: "Invalid merchant ID" });
    }

    // Validate orderDetail
    const orderExists = await Merchantsalesmanagement.findById(orderDetail);
    if (!orderExists) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const newDelivery = new Merchantproductdelivary({
      merchantID,
      orderDetail,
      trackingNumber,
      shipping,
    });

    await newDelivery.save();
    res.status(201).json({ success: true, message: "Delivery record created successfully", data: newDelivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all delivery records
exports.getAllDeliveries = async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Convert page and limit to integers with default values
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5; // Default items per page is 5

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch deliveries with pagination
    const deliveries = await Merchantproductdelivary.find()
      .populate("merchantID", "name email")
      .populate("orderDetail", "orderDate amount price createdAt updatedAt") // Ensure these fields are populated
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by latest created

    // Get total count for pagination metadata
    const total = await Merchantproductdelivary.countDocuments();

    // Construct pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    // Ensure `data` is always an array (even if no records are found)
    const responseData = Array.isArray(deliveries) ? deliveries : [];

    // Construct the response with `data` first and `pagination` afterward
    res.status(200).json({
      success: true,
      message: "Delivery records fetched successfully",
      data: responseData, // Ensure `data` is always an array
      pagination,         // Pagination comes after
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single delivery record by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the delivery record by ID and populate related fields
    const delivery = await Merchantproductdelivary.findById(id)
      .populate("merchantID", "name email")
      .populate("orderDetail", "orderDate amount");

    // If no delivery record is found, return a 404 error
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    // Wrap the delivery object in an array to ensure the response is an array of objects
    res.status(200).json({
      success: true,
      message: "Delivery record fetched successfully",
      data: [delivery], // Wrap the delivery object in an array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a delivery record by ID
exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchantID, orderDetail, trackingNumber, shipping } = req.body;

    // Validate merchantID
    if (merchantID) {
      const merchantExists = await User.findById(merchantID);
      if (!merchantExists) {
        return res.status(400).json({ success: false, message: "Invalid merchant ID" });
      }
    }

    // Validate orderDetail
    if (orderDetail) {
      const orderExists = await Merchantsalesmanagement.findById(orderDetail);
      if (!orderExists) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
      }
    }

    const updatedDelivery = await Merchantproductdelivary.findByIdAndUpdate(
      id,
      { merchantID, orderDetail, trackingNumber, shipping },
      { new: true, runValidators: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    res.status(200).json({ success: true, message: "Delivery record updated successfully", data: updatedDelivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a delivery record by ID
exports.deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDelivery = await Merchantproductdelivary.findByIdAndDelete(id);

    if (!deletedDelivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    res.status(200).json({ success: true, message: "Delivery record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};