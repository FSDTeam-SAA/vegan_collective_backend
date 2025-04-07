const express = require("express");
const router = express.Router();
const merchantSupportController = require("../controllers/merchantSupport.controller");

// Create a support ticket
router.post("/merchentsupport", merchantSupportController.createTicket);

// Get all support tickets
router.get("/merchentsupport", merchantSupportController.getAllTickets);

// Get all support tickets by merchantID
router.get("/merchentsupport/merchant/:merchantID", merchantSupportController.getTicketsByMerchantID);


// Get a single support ticket
router.get("/merchentsupport/:id", merchantSupportController.getTicketById);

// Update a support ticket
router.put("/merchentsupport/:id", merchantSupportController.updateTicket);

// Delete a support ticket
router.delete("/merchentsupport/:id", merchantSupportController.deleteTicket);

module.exports = router;
