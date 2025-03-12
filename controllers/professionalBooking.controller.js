const Professionalservicebooking = require('../models/professionalServiceBooking.model');
const mongoose = require('mongoose');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userID, bookingInfo, payWith, cardHolderName, cardNumber, expiryDate, cvv } = req.body;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID", 
                data: null 
            });
        }

        // Validate service IDs in bookingInfo
        for (const info of bookingInfo) {
            if (!mongoose.Types.ObjectId.isValid(info.serviceID)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid Service ID", 
                    data: null 
                });
            }
        }

        // Create a new booking
        const newBooking = new Professionalservicebooking({
            userID,
            bookingInfo,
            payWith,
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
            status: "pending"
        });

        await newBooking.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Booking created successfully", 
            data: newBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message, 
            data: null 
        });
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

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found",
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalBookings,
                    recordsPerPage: limit
                }
            });
        }

        // Return paginated response
        res.status(200).json({
            success: true,
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
        res.status(500).json({ 
            success: false, 
            message: "Server error while fetching bookings", 
            error: error.message 
        });
    }
};


// Get bookings by user ID or service ID with formatted response
exports.getBookingsByFilter = async (req, res) => {
    try {
        const { userID, serviceID, page = 1, limit = 10 } = req.query;
        let filter = {};
        
        if (userID) {
            filter.userID = userID;
        }

        if (serviceID) {
            filter['bookingInfo.serviceID'] = serviceID;
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch total number of bookings for pagination metadata
        const totalBookings = await Professionalservicebooking.countDocuments(filter);

        const bookings = await Professionalservicebooking.find(filter)
            .populate({
                path: 'bookingInfo.serviceID',
                model: 'Professionalservices',
                select: 'serviceName price sessionType'
            })
            .skip(skip)
            .limit(limitNumber);

        if (!bookings.length) {
            return res.status(404).json({
                success: false,
                message: "No bookings found",
                data: [],
                pagination: {
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalBookings / limitNumber),
                    totalRecords: totalBookings,
                    recordsPerPage: limitNumber
                }
            });
        }

        // Format the response data
        const formattedBookings = bookings.map(booking => ({
            bookingInfo: booking.bookingInfo.map(info => ({
                serviceID: {
                    _id: info.serviceID?._id,
                    serviceName: info.serviceID?.serviceName,
                    price: info.serviceID?.price,
                    sessionType: info.serviceID?.sessionType
                },
                date: info.date,
                time: info.time,
                _id: info._id
            })),
            payWith: booking.payWith,
            cardHolderName: booking.cardHolderName,
            cardNumber: booking.cardNumber,
            expiryDate: booking.expiryDate,
            cvv: booking.cvv,
            status: booking.status
        }));

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: formattedBookings,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalBookings / limitNumber),
                totalRecords: totalBookings,
                recordsPerPage: limitNumber
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};



// Update a booking by user ID
exports.updateBookingByUserId = async (req, res) => {
    try {
        const { userId } = req.params;  // Get the userId from URL params
        const { bookingInfo, payWith, cardHolderName, cardNumber, expiryDate, cvv, status } = req.body;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID", 
                data: null 
            });
        }

        // Validate service IDs in bookingInfo
        if (bookingInfo && Array.isArray(bookingInfo)) {
            for (const info of bookingInfo) {
                if (!mongoose.Types.ObjectId.isValid(info.serviceID)) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Invalid Service ID", 
                        data: null 
                    });
                }
            }
        }

        // Find the booking by userId and update it
        const updatedBooking = await Professionalservicebooking.findOneAndUpdate(
            { userID: userId },  // Match by userID
            { 
                bookingInfo, 
                payWith, 
                cardHolderName, 
                cardNumber, 
                expiryDate, 
                cvv, 
                status 
            },  // Update the booking with the provided data
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found for this user", 
                data: null 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Booking updated successfully", 
            data: {
                ...updatedBooking.toObject(),
                status: updatedBooking.status // Include status in the response
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while updating booking",
            error: error.message,
            data: null
        });
    }
};



// Delete a booking by ID
exports.deleteBookingByUserId = async (req, res) => {
    try {
        const { userId } = req.params;  // Get the userId from URL params

        // Find and delete the booking by userId
        const deletedBooking = await Professionalservicebooking.findOneAndDelete({ userID: userId });

        if (!deletedBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found for this user",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            data: deletedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
            data: []
        });
    }
};
