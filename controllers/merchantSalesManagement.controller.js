const Merchantsalesmanagement = require("../models/merchantSalesManagement.model");
const MerchantProducts = require("../models/merchantProducts.model");
const mongoose = require("mongoose");

// Generate unique orderSlug (ORD-001, ORD-002, etc.)
const generateOrderSlug = async () => {
  const lastOrder = await Merchantsalesmanagement.findOne({}, {}, { sort: { createdAt: -1 } });
  const sequence = lastOrder ? parseInt(lastOrder.orderSlug.split("-")[1]) + 1 : 1;
  return `ORD-${String(sequence).padStart(3, "0")}`;
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { merchantID, userID, orderedItem } = req.body;

    // Calculate total price based on product price and quantity
    let totalPrice = 0;
    for (const item of orderedItem) {
      const product = await mongoose.model("MerchantProducts").findById(item.productID);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productID} not found.`,
        });
      }
      totalPrice += product.price * item.quantity;
    }

    // Generate orderSlug
    const orderSlug = await generateOrderSlug();

    // Create the order
    const newOrder = new Merchantsalesmanagement({
      merchantID,
      userID,
      orderedItem,
      price: totalPrice,
      orderSlug,
      status: "pending",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while creating the order.",
    });
  }
};

// Get all orders with pagination and filters
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, item, last30Days, last1Days } = req.query;
    const query = {};

    // Search by orderSlug or status
    if (search) {
      query.$or = [
        { orderSlug: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by specific item
    if (item) {
      try {
        query["orderedItem.productID"] = new mongoose.Types.ObjectId(item);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format.",
        });
      }
    }

    // Filter by last 30 days
    if (last30Days === "true") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    // Filter by last 1 day
    if (last1Days === "true") {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      query.createdAt = { $gte: oneDayAgo };
    }

    // Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch orders with pagination
    const orders = await Merchantsalesmanagement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("orderedItem.productID", "name price");

    // Count total documents for pagination metadata
    const totalOrders = await Merchantsalesmanagement.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalOrders / limitNumber),
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while fetching orders.",
    });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Merchantsalesmanagement.findById(req.params.id)
      .populate("orderedItem.productID", "name price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while fetching the order.",
    });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    // Find and update the order
    const updatedOrder = await Merchantsalesmanagement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );

    // If no order is found, return a 404 error
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Wrap the updated order in an array before sending the response
    res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      data: [updatedOrder], // Wrap the object in an array
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while updating the order.",
    });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Merchantsalesmanagement.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while deleting the order.",
    });
  }
};