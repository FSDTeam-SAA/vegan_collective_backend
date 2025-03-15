const Userpayment = require('../models/userPayment.model')

// for customer booking details
const getUserPaymentsByService = async (req, res) => {
  try {
    const { userID, professionalServicesId } = req.body

    if (!userID || !professionalServicesId) {
      return res.status(400).json({
        success: false,
        message: 'userID and professionalServicesId are required',
      })
    }

    const payments = await Userpayment.find({ userID, professionalServicesId })
      .populate('professionalServicesId')
      .populate('userID')

    res.status(200).json({ success: true, data: payments })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

//for Professionals with
const getProfessionalPaymentsWithBooking = async (req, res) => {
  try {
    const { userID } = req.body
    const { page = 1, limit = 10 } = req.query

    if (!userID) {
      return res.status(400).json({ message: 'userID is required' })
    }

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber

    const totalItems = await Userpayment.countDocuments({
      userID,
      sellerType: 'Professional',
      serviceBookingTime: { $ne: null },
    })

    const payments = await Userpayment.find({
      userID,
      sellerType: 'Professional',
      serviceBookingTime: { $ne: null },
    })
      .populate('userID')
      .populate('professionalServicesId')
      .skip(skip)
      .limit(limitNumber)

    const totalPages = Math.ceil(totalItems / limitNumber)

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage: limitNumber,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
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
