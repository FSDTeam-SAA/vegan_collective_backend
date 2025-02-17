const Professionalservicebooking = require('../models/professionalServiceBooking.model');
const mongoose = require('mongoose');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userID, professionalID, bookingInfo, payWith, cardHolderName, cardNumber, expiryDate, cvv } = req.body;

        // Validate user ID and professional ID
        const isValidUserID = mongoose.Types.ObjectId.isValid(userID);
        const isValidProfessionalID = mongoose.Types.ObjectId.isValid(professionalID);

        if (!isValidUserID || !isValidProfessionalID) {
            return res.status(400).json({ message: "Invalid User ID or Professional ID" });
        }

        // Validate service IDs in bookingInfo
        for (const info of bookingInfo) {
            if (!mongoose.Types.ObjectId.isValid(info.serviceID)) {
                return res.status(400).json({ message: "Invalid Service ID" });
            }
        }

        const newBooking = new Professionalservicebooking({
            userID,
            professionalID,
            bookingInfo,
            payWith,
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking created successfully", data: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Professionalservicebooking.find()
            .populate({
                path: 'userID',
                model: 'User', // Ensure the model name matches exactly
                select: 'fullName email role' // Include only specific fields from User
            })
            .populate({
                path: 'professionalID',
                model: 'Professionalinfo', // Ensure the model name matches exactly
                select: 'professionalName contactDetails' // Include only specific fields from Professionalinfo
            })
            .populate({
                path: 'bookingInfo.serviceID',
                model: 'Professionalservices', // Fixed model name here
                select: 'serviceName price sessionType' // Include only specific fields from Professionalservices
            })
            .select('userID professionalID bookingInfo payWith cardHolderName cardNumber expiryDate cvv'); // Limit fields in the main document

        res.status(200).json({ message: "Bookings retrieved successfully", data: bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Professionalservicebooking.findById(id)
            .populate({
                path: 'userID',
                model: 'User', // Ensure the model name matches exactly
                select: 'fullName email role' // Include only specific fields from User
            })
            .populate({
                path: 'professionalID',
                model: 'Professionalinfo', // Ensure the model name matches exactly
                select: 'professionalName contactDetails' // Include only specific fields from Professionalinfo
            })
            .populate({
                path: 'bookingInfo.serviceID',
                model: 'Professionalservices', // Fixed model name here
                select: 'serviceName price sessionType' // Include only specific fields from Professionalservices
            })
            .select('userID professionalID bookingInfo payWith cardHolderName cardNumber expiryDate cvv'); // Limit fields in the main document

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking retrieved successfully", data: booking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await Professionalservicebooking.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking updated successfully", data: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBooking = await Professionalservicebooking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};