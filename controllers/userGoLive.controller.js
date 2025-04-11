const Organizationgolive = require('../models/organizationGoLive.model');
const Userpayment = require('../models/userPayment.model');
const mongoose = require('mongoose');

exports.checkUserGoLivePurchase = async (req, res) => {
  try {
    const { userID } = req.params;

    // Validate userID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID format',
        data: null
      });
    }

    // Find all payments where the user bought organization GoLive events
    const payments = await Userpayment.find({
      userID,
      sellerType: 'Organization',
      organizationGoLiveID: { $ne: null },
      status: 'confirmed'
    }).populate('organizationGoLiveID');

    if (!payments || payments.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No organization GoLive purchases found for this user',
        data: []
      });
    }

    // Process each purchased event
    const data = await Promise.all(payments.map(async (payment) => {
      const event = payment.organizationGoLiveID;
      if (!event) return null;

      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const now = new Date();

      return {
        eventId: event._id,
        eventTitle: event.eventTitle,
        description: event.description,
        date: event.date,
        time: event.time,
        eventType: event.eventType,
        price: event.price,
        meetingId: event.meetingId,
        meetingLink: event.meetingLink, // This is the field you want to add
        purchaseDate: payment.createdAt,
        purchaseAmount: payment.amount,
        eventStatus: eventDateTime > now ? 'upcoming' : 'past',
        organizationId: payment.sellerID
      };
    }));

    // Filter out null values
    const validEvents = data.filter(event => event !== null);

    res.status(200).json({
      success: true,
      message: validEvents.length > 0 
        ? 'Organization GoLive purchases retrieved successfully' 
        : 'No valid events found (possibly deleted events)',
      data: validEvents
    });

  } catch (error) {
    console.error('Error checking user GoLive purchases:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve GoLive purchases',
      error: error.message,
      data: null
    });
  }
};