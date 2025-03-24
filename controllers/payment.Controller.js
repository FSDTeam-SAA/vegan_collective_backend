const Merchantinfo = require('../models/merchantInfo.model')
const Professionalinfo = require('../models/professionalInfo.model')
const Organizationinfo = require('../models/organizationInfo.model')
const User = require('../models/user.model')
const Userpayment = require('../models/userPayment.model')
const ProfessionalServices = require("../models/professionalServices.model");
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const savePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, userID } = req.body

    // Find user by ID
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const email = user.email

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 })
    let customer = customers.data.length ? customers.data[0] : null

    if (!customer) {
      customer = await stripe.customers.create({ email })
    }

    const customerId = customer.id

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Save payment method details to the database
    const paymentEntry = new Userpayment({
      userID,
      customerId,
      paymentMethodId,
    })

    await paymentEntry.save()

    // Update the user's paymentAdded field
    user.paymentAdded = true
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Payment method saved successfully',
      data: paymentEntry,
    })
  } catch (error) {
    console.error('Error saving payment method:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}


const purchaseMethod = async (req, res) => {
  try {
    const {
      userID,
      amount,
      merchantID,
      professionalID,
      organizationID,
      productId,
      professionalServicesId,
      serviceBookingTime,
      goLiveID,
    } = req.body

    // Validate required fields
    if (!userID || !amount) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' })
    }

    // Find user
    const user = await User.findOne({ _id: userID })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Check user payment method
    const userPayment = await Userpayment.findOne({ userID })
    if (!userPayment) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid payment method',
      })
    }

    const { customerId, paymentMethodId } = userPayment

    // console.log("customer payment info____",customerId, paymentMethodId)
    // Check if payment method is already attached to the customer
    const paymentMethod = await stripe.paymentMethods
      .retrieve(paymentMethodId)
      .catch(() => null)

    if (!paymentMethod || paymentMethod.customer !== customerId) {
      // Reattach the payment method if needed
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })

      // Set the default payment method for the customer
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
    }

    // Determine seller type and ID
    let seller, sellerID, sellerType, sellerStripeAccountId

    if (merchantID) {
      seller = await Merchantinfo.findById(merchantID)
      sellerType = 'Merchant'
    } else if (professionalID) {
      console.log("professionalID____", professionalID)
      seller = await Professionalinfo.findOne({userId:professionalID})
      sellerType = 'Professional'
    } else if (organizationID) {
      seller = await Organizationinfo.findOne(organizationID)
      sellerType = 'Organization'
    } 
    else {
      return res
        .status(400)
        .json({ success: false, message: 'No valid seller ID provided' })
    }

    // Validate seller existence
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: `${sellerType} not found` })
    }

    sellerID = seller._id
    sellerStripeAccountId = seller.stripeAccountId

    if (!sellerStripeAccountId) {
      return res.status(400).json({
        success: false,
        message: `${sellerType} does not have a connected Stripe account`,
      })
    }

    // Check if serviceBookingTime is already booked
    if (serviceBookingTime) {
      const existingBooking = await Userpayment.findOne({
        serviceBookingTime: serviceBookingTime,
        sellerID: sellerID, // Ensure it is the same seller
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: 'Service time is already booked',
        });
      }
    }

    // Charge the customer
    const paymentIntent = await chargeCustomer(
      customerId,
      paymentMethodId,
      amount
    )
    // console.log(paymentIntent, 'PaymentIntent created')

    if (paymentIntent.status === 'succeeded') {
      const vendorAmount = Math.round(amount * 0.9 * 100) // Vendor gets 90%

      // Transfer money to the seller
      const transfer = await stripe.transfers.create({
        amount: vendorAmount,
        currency: 'usd',
        destination: sellerStripeAccountId,
        transfer_group: `ORDER_${paymentIntent.id}`,
      })

      // Save transaction record
      const newPaymentRecord = new Userpayment({
        userID,
        customerId,
        paymentMethodId,
        sellerID,
        sellerType,
        sellerStripeAccountId,
        amount,
        productId: productId || [],
        professionalServicesId: professionalServicesId || null,
        serviceBookingTime: serviceBookingTime,
        goLiveID,
      })
      await newPaymentRecord.save()

      return res.status(200).json({
        success: true,
        message: 'Payment processed and transferred successfully',
        paymentIntentId: paymentIntent.id,
        transferId: transfer.id,
        amountReceived: paymentIntent.amount_received,
        transferredAmount: vendorAmount / 100,
        purchasedProducts: productId,
        bookedService: professionalServicesId,
        bookingTime: serviceBookingTime,
      })
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed' })
    }
  } catch (error) {
    // console.error('Error processing payment:', error)
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      details: error.message,
    })
  }
}


const chargeCustomer = async (customerId, paymentMethodId, amount) => {
  return await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    off_session: true,
    payment_method_types: ['card'],
  })
}

const removePaymentMethod = async (req, res) => {
  try {
    const { userID } = req.body

    if (!userID) {
      return res.status(400).json({ status: false, error: 'Missing user ID' })
    }

    // Find the user's payment details
    const userPayment = await Userpayment.findOne({ userID })
    if (!userPayment) {
      return res
        .status(404)
        .json({ status: false, error: 'Payment method not found' })
    }

    const { customerId, paymentMethodId } = userPayment

    // Detach the payment method from the customer in Stripe
    await stripe.paymentMethods.detach(paymentMethodId)

    // Remove payment details from the database
    await Userpayment.deleteOne({ userID })

    // Update the user's paymentAdded field to false
    await User.findByIdAndUpdate(userID, { paymentAdded: false })

    return res.status(200).json({
      status: true,
      message: 'Payment method removed successfully',
    })
  } catch (error) {
    console.error('Error removing payment method:', error)
    return res
      .status(500)
      .json({ status: false, error: 'Failed to remove payment method' })
  }
}


// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// POST: Confirm Booking
const confirmBooking = async (req, res) => {
  try {
    const { userID, serviceID } = req.body;

    // Validate required fields
    if (!userID || !serviceID) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Find user
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the booking record
    const booking = await Userpayment.findOne({ professionalServicesId: serviceID, userID });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Find the professional service details
    const professionalService = await ProfessionalServices.findOne({ _id: booking.professionalServicesId });
    if (!professionalService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Send email reminder 30 minutes before the service time
    const email = user.email;
    const serviceName = professionalService.name;
    const serviceBookingTime = booking.serviceBookingTime;
    

    // Calculate the reminder time (30 minutes before the booking time)
    const reminderTime = new Date(serviceBookingTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30);

    // Schedule the email reminder
    const timeUntilReminder = reminderTime - Date.now();
    if (timeUntilReminder > 0) {
      setTimeout(async () => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Booking Reminder',
          text: `Reminder: Your ${serviceName} service is scheduled at ${serviceBookingTime}.`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully');
      }, timeUntilReminder);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed and reminder scheduled',
      email,
      serviceName,
      serviceBookingTime,
      
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Booking confirmation failed',
      details: error.message,
    });
  }
};

// GET: Get Booking Details by User ID
const getBookingDetailsByUserID = async (req, res) => {
  try {
    const { userID } = req.params; // Get userID from URL parameters

    if (!userID) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Find the user to get their email
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all bookings for the user and populate professional service details
    const bookings = await Userpayment.find({ userID }).populate('professionalServicesId');

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: 'No bookings found for this user' });
    }

    // Format response while checking for missing professionalServicesId
    const bookingDetails = bookings
      .filter(booking => booking.professionalServicesId) // Exclude bookings with missing services
      .map(booking => ({
        serviceBookingTime: booking.serviceBookingTime,
        email: user.email, // Include the user's email in each booking object
        amountPaid: booking.amountPaid || 0,
        status: booking.status || 'Pending',
        professionalService: {
          serviceName: booking.professionalServicesId.serviceName,
          sessionType: booking.professionalServicesId.sessionType,
          timeSlots: booking.professionalServicesId.timeSlots,
          date: booking.professionalServicesId.date,
        },
      }));

    if (!bookingDetails.length) {
      return res.status(404).json({
        success: false,
        message: 'No valid bookings found (some services may have been deleted).',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      bookings: bookingDetails, // The email is already included in each booking object
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      details: error.message,
    });
  }
};


// GET: Get Calendar Data by User ID with Month and Year Filtering
const getCalendarData = async (req, res) => {
  try {
    const { userID } = req.params; // Get userID from URL parameters
    const { month, year } = req.query; // Get month and year from query parameters

    if (!userID) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    // Find the user to get their email
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all bookings for the user and populate professional service details
    const bookings = await Userpayment.find({ userID }).populate('professionalServicesId');

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        message: 'No bookings found for this user',
        calendarData: [], // Return empty array
      });
    }

    // Filter bookings by month and year
    const filteredBookings = bookings.filter((booking) => {
      if (!booking.professionalServicesId) return false; // Skip bookings with missing services

      const serviceDate = new Date(booking.professionalServicesId.date);
      const serviceMonth = serviceDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const serviceYear = serviceDate.getFullYear();

      // Check if the booking matches the provided month and year
      return serviceMonth === parseInt(month) && serviceYear === parseInt(year);
    });

    // Format response for calendar data
    const calendarData = filteredBookings.map((booking, index) => {
      const serviceDate = new Date(booking.professionalServicesId.date);

      return {
        id: (index + 1).toString(), // Generate a unique ID for each calendar event
        email: user.email, // User's email
        title: booking.professionalServicesId.serviceName, // Service name as the title
        datetime: serviceDate.toISOString(), // Convert date to ISO string
        type: "booking", // Static type for all events
        serviceBookingTime: booking.serviceBookingTime, // Include the service booking time
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Calendar data retrieved successfully',
      calendarData, // Will be an empty array if no bookings match
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calendar data',
      details: error.message,
    });
  }
};


const getProfessionalCalendarData = async (req, res) => {
  try {
    const { professionalId } = req.params; // Get professionalId from URL parameters
    const { month, year } = req.query; // Get month and year from query parameters

    if (!professionalId) {
      return res.status(400).json({ success: false, message: 'Professional ID is required' });
    }

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    // Find all services provided by the professional
    const professionalServices = await Professionalservices.find({ userID: professionalId });

    if (!professionalServices.length) {
      return res.status(200).json({
        success: true,
        message: 'No services found for this professional',
        calendarData: [], // Return empty array
      });
    }

    // Extract service IDs from the professional services
    const serviceIds = professionalServices.map(service => service._id);

    // Find all payments (bookings) associated with these services
    const bookings = await Userpayment.find({ professionalServicesId: { $in: serviceIds } }).populate('professionalServicesId');

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        message: 'No bookings found for these services',
        calendarData: [], // Return empty array
      });
    }

    // Filter bookings by month and year
    const filteredBookings = bookings.filter((booking) => {
      if (!booking.professionalServicesId) return false; // Skip bookings with missing services

      const serviceDate = new Date(booking.professionalServicesId.date);
      const serviceMonth = serviceDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const serviceYear = serviceDate.getFullYear();

      // Check if the booking matches the provided month and year
      return serviceMonth === parseInt(month) && serviceYear === parseInt(year);
    });

    // Format response for calendar data
    const calendarData = filteredBookings.map((booking, index) => {
      const serviceDate = new Date(booking.professionalServicesId.date);

      return {
        id: (index + 1).toString(), // Generate a unique ID for each calendar event
        title: booking.professionalServicesId.serviceName, // Service name as the title
        datetime: serviceDate.toISOString(), // Convert date to ISO string
        type: "booking", // Static type for all events
        serviceBookingTime: booking.serviceBookingTime, // Include the service booking time
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Professional calendar data retrieved successfully',
      calendarData, // Will be an empty array if no bookings match
    });
  } catch (error) {
    console.error('Error fetching professional calendar data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve professional calendar data',
      details: error.message,
    });
  }
};

// check user payment method save or not
const checkPaymentMethodAddOrNot = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user record
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: user.paymentAdded ? 'Payment method exists' : 'No payment method found', 
            paymentAdded: user.paymentAdded 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

module.exports = {
  savePaymentMethod,
  purchaseMethod,
  removePaymentMethod,
  confirmBooking,
  getBookingDetailsByUserID,
  getCalendarData,
  getProfessionalCalendarData,
  checkPaymentMethodAddOrNot,
}
