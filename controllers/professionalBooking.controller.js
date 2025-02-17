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


// Get all bookings with pagination
exports.getAllBookings = async (req, res) => {
    try {
        // Extract query parameters for pagination
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
        const skip = (page - 1) * limit;

        // Fetch total number of bookings for pagination metadata
        const totalBookings = await Professionalservicebooking.countDocuments();

        // Fetch paginated bookings with populated fields
        const bookings = await Professionalservicebooking.find()
            .populate({
                path: 'userID',
                model: 'User',
                select: 'fullName email role'
            })
            .populate({
                path: 'professionalID',
                model: 'Professionalinfo',
                select: 'professionalName contactDetails'
            })
            .populate({
                path: 'bookingInfo.serviceID',
                model: 'Professionalservices',
                select: 'serviceName price sessionType'
            })
            .select('userID professionalID bookingInfo payWith cardHolderName cardNumber expiryDate cvv status') // Include status
            .skip(skip)
            .limit(limit);

        // Calculate total pages
        const totalPages = Math.ceil(totalBookings / limit);

        // Return paginated response
        res.status(200).json({
            message: "Bookings retrieved successfully",
            data: bookings.map(booking => ({
                ...booking.toObject(),
                status: booking.status // Explicitly include status in the response
            })),
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalBookings,
                recordsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single booking by ID and return the desired response structure
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the booking by ID and populate the necessary fields
        const booking = await Professionalservicebooking.findById(id)
            .populate({
                path: 'bookingInfo.serviceID',
                model: 'Professionalservices',
                select: 'serviceName price sessionType' // Include only specific fields from Professionalservices
            });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Format the bookingInfo array
        const formattedBookingInfo = booking.bookingInfo.map(info => ({
            serviceID: {
                _id: info.serviceID._id,
                serviceName: info.serviceID.serviceName,
                price: info.serviceID.price,
                sessionType: info.serviceID.sessionType,
            },
            date: info.date, // Assuming 'date' is part of the bookingInfo schema
            time: info.time, // Assuming 'time' is part of the bookingInfo schema
            _id: info._id,   // Include the ID of the bookingInfo entry
        }));

        // Construct the final response object
        const responseData = {
            bookingInfo: formattedBookingInfo,
            payWith: booking.payWith,
            cardHolderName: booking.cardHolderName,
            cardNumber: booking.cardNumber,
            expiryDate: booking.expiryDate,
            cvv: booking.cvv,
            status: booking.status,
        };

        res.status(200).json({
            message: "Booking retrieved successfully",
            data: responseData, // Return the formatted response
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Allow updating the status

        const updatedBooking = await Professionalservicebooking.findByIdAndUpdate(
            id,
            { ...req.body, status }, // Update the status if provided
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ 
            message: "Booking updated successfully", 
            data: {
                ...updatedBooking.toObject(),
                status: updatedBooking.status // Include status in the response
            }
        });
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