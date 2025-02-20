const express = require("express");
const router = express.Router();
const merchantSalesManagementController = require("../controllers/merchantSalesManagement.controller");

// Create a new order
router.post("/merchantorder", merchantSalesManagementController.createOrder);

// Get all orders with pagination and filters
router.get("/merchantorder", merchantSalesManagementController.getAllOrders);

// Get a single order by ID
router.get("/merchantorder/:id", merchantSalesManagementController.getOrderById);

// Update an order by ID
router.put("/merchantorder/:id", merchantSalesManagementController.updateOrder);

// Delete an order by ID
router.delete("/merchantorder/:id", merchantSalesManagementController.deleteOrder);

module.exports = router;