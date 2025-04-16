const Userpayment = require('../models/userPayment.model');
const OrganizationVolunteer = require('../models/organizationvolunteer.model');

exports.getUserOverview = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Products Ordered - Count where productId array is not empty
    const productsOrdered = await Userpayment.countDocuments({ 
      userID: userId,
      productId: { $exists: true, $not: { $size: 0 } }
    });

    // 2. Services Booked - Count where professionalServicesId exists (not null)
    const servicesBooked = await Userpayment.countDocuments({ 
      userID: userId,
      professionalServicesId: { $exists: true, $ne: null }
    });

    // 3. Volunteer Events - Count events where user is an attendee
    const volunteerEvents = await OrganizationVolunteer.countDocuments({
      "attendeeDetail.userID": userId
    });

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