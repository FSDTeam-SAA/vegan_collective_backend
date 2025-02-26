const Merchantsupport = require("../models/merchantSupport.model");
const User = require("../models/user.model"); // Ensure you have a User model
const mongoose = require("mongoose");

// Function to generate the next ticketSlug
const generateTicketSlug = async () => {
    const lastTicket = await Merchantsupport.findOne().sort({ createdAt: -1 });

    let nextTicketNumber = 1; // Default if no tickets exist
    if (lastTicket && lastTicket.ticketSlug) {
        const lastTicketNumber = parseInt(lastTicket.ticketSlug.split("-")[1], 10);
        if (!isNaN(lastTicketNumber)) {
            nextTicketNumber = lastTicketNumber + 1;
        }
    }

    return `TICK-${String(nextTicketNumber).padStart(3, "0")}`;
};

// Create a support ticket
exports.createTicket = async (req, res) => {
    try {
        const { merchantID, subject, message, status } = req.body;

        // Validate merchantID
        if (!mongoose.Types.ObjectId.isValid(merchantID)) {
            return res.status(400).json({
                success: false,
                message: "Invalid merchantID",
            });
        }

        const userExists = await User.findById(merchantID);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "Merchant not found",
            });
        }

        // Generate the next ticketSlug
        const ticketSlug = await generateTicketSlug();

        const newTicket = new Merchantsupport({
            merchantID,
            ticketSlug,
            subject,
            message,
            status: status || "pending", // Default to "pending" if not provided
        });

        await newTicket.save();
        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: newTicket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all support tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Merchantsupport.find()
            .populate("merchantID", "name email")
            .select("-__v"); // Exclude MongoDB's internal field

        res.status(200).json({
            success: true,
            message: "Tickets retrieved successfully",
            data: tickets,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get a single support ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID",
            });
        }

        const ticket = await Merchantsupport.findById(id)
            .populate("merchantID", "name email")
            .select("-__v");

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket retrieved successfully",
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a support ticket
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID",
            });
        }

        const updatedTicket = await Merchantsupport.findByIdAndUpdate(
            id,
            { subject, message, status },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            data: updatedTicket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete a support ticket
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID",
            });
        }

        const deletedTicket = await Merchantsupport.findByIdAndDelete(id);
        if (!deletedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};