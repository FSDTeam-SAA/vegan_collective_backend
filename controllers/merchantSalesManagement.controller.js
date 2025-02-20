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
        return res.status(404).json({ message: `Product with ID ${item.productID} not found.` });
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
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders with pagination and filters
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, item, last30Days } = req.query;

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
      query["orderedItem.productID"] = mongoose.Types.ObjectId(item);
    }

    // Filter by last 30 days
    if (last30Days === "true") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const orders = await Merchantsalesmanagement.paginate(query, options);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Merchantsalesmanagement.findById(req.params.id)
      .populate("merchantID", "name")
      .populate("userID", "name email")
      .populate("orderedItem.productID", "name price");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Merchantsalesmanagement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Merchantsalesmanagement.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};