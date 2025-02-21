const express = require("express");
const router = express.Router();
const merchantProductDeliveryController = require("../controllers/merchantProductDelivary.controller");

// Create a new delivery
router.post("/merchantProductDelivery", merchantProductDeliveryController.createDelivery);

// Get all deliveries
router.get("/merchantProductDelivery", merchantProductDeliveryController.getAllDeliveries);

// Get a single delivery by ID
router.get("/merchantProductDelivery/:id", merchantProductDeliveryController.getDeliveryById);

// Update a delivery by ID
router.put("/merchantProductDelivery/:id", merchantProductDeliveryController.updateDelivery);

// Delete a delivery by ID
router.delete("/merchantProductDelivery/:id", merchantProductDeliveryController.deleteDelivery);

module.exports = router;
