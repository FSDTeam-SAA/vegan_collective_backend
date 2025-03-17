const Userpayment = require('../models/userPayment.model')

// for customer booking details

// const getUserPaymentsByService = async (req, res) => {
//   try {
//     const { userID, page = 1, limit = 10 } = req.query

//     if (!userID) {
//       return res.status(400).json({
//         success: false,
//         message: 'userID is required',
//       })
//     }

//     const pageNum = parseInt(page)
//     const limitNum = parseInt(limit)

//     const skip = (pageNum - 1) * limitNum

//     // Fetch the payments for the user, but filter out records where professionalServicesId is null
//     const payments = await Userpayment.find({
//       userID,
//       professionalServicesId: { $ne: null }, // Filter out null professionalServicesId
//     })
//       .skip(skip)
//       .limit(limitNum)
//       .populate('professionalServicesId')
//       .populate('userID')

//     // Generate and update booking IDs for filtered records if they don't already have one
//     for (let payment of payments) {
//       if (!payment.bookingID) {
//         const count = await Userpayment.countDocuments()
//         const formattedCount = String(count + 1).padStart(4, '0') // Ensure it's always 4 digits
//         payment.bookingID = `Bok-${formattedCount}`
//         await payment.save()
//       }
//     }

//     // Get total count of payments for pagination information
//     const totalPayments = await Userpayment.countDocuments({
//       userID,
//       professionalServicesId: { $ne: null },
//     })

//     // Calculate total number of pages
//     const totalPages = Math.ceil(totalPayments / limitNum)

//     res.status(200).json({
//       success: true,
//       data: payments,
//       pagination: {
//         page: pageNum,
//         totalPages,
//         totalResults: totalPayments,
//       },
//     })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }
const getUserPaymentsByService = async (req, res) => {
  try {
    const { userID, page = 1, limit = 10 } = req.query

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: 'userID is required',
      })
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Fetch the payments for the user, but filter out records where professionalServicesId is null
    const payments = await Userpayment.find({
      userID,
      professionalServicesId: { $ne: null }, // Filter out null professionalServicesId
    })
      .skip(skip)
      .limit(limitNum)
      .populate('professionalServicesId')
      .populate('userID')

    // Generate and update unique booking IDs if they don't already have one
    for (let payment of payments) {
      if (!payment.bookingID) {
        // Use the unique ObjectId from MongoDB to create a unique Booking ID
        const uniqueId = payment._id.toString().slice(-6) // Use last 6 characters of _id
        payment.bookingID = `Bok-${uniqueId}`
        await payment.save()
      }
    }

    // Get total count of payments for pagination information
    const totalPayments = await Userpayment.countDocuments({
      userID,
      professionalServicesId: { $ne: null },
    })

    // Calculate total number of pages
    const totalPages = Math.ceil(totalPayments / limitNum)

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        totalPages,
        totalResults: totalPayments,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


//for Professionals with
const getProfessionalPaymentsWithBooking = async (req, res) => {
  try {
    const { userID } = req.query; 
    const { page = 1, limit = 10 } = req.query;

    if (!userID) {
      return res.status(400).json({ message: 'userID is required' });
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalItems = await Userpayment.countDocuments({
      userID,
      sellerType: 'Professional',
      serviceBookingTime: { $ne: null },
    });

    const payments = await Userpayment.find({
      userID,
      sellerType: 'Professional',
      serviceBookingTime: { $ne: null },
    })
      .populate('userID')
      .populate('professionalServicesId')
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalItems / limitNumber);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update payment status (cancel or confirmed)
const updatePaymentStatus = async (req, res) => {
  try {
    const { userID, professionalServicesId } = req.body

    if (!userID || !professionalServicesId) {
      return res.status(400).json({
        message: 'Valid userID and professionalServicesId are required',
      })
    }

    const updatedPayment = await Userpayment.findOneAndUpdate(
      { userID, professionalServicesId },
      { status: 'canceled' },
      { new: true }
    )

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    res.status(200).json({ success: true, data: updatedPayment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getUserPaymentsByService,
  getProfessionalPaymentsWithBooking,
  updatePaymentStatus,
}
