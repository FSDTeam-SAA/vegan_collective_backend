const Userpayment = require('../models/userPayment.model');
const Professionalservicebooking = require('../models/professionalServices.model');
const Organizationeventmanagement = require('../models/organizationEventManagement.model');

exports.getUserOverview = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the number of products ordered
    const productsOrdered = await Userpayment.countDocuments({ userID: userId });

    // Fetch the number of services booked
    const servicesBooked = await Professionalservicebooking.countDocuments({ userID: userId });

    // Fetch the number of volunteer events
    const volunteerEvents = await Organizationeventmanagement.countDocuments({ organizationID: userId });

    res.status(200).json({
      success: true,
      message: 'User overview fetched successfully',
      data: {
        productsOrdered,
        servicesBooked,
        volunteerEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
