const Merchantinfo = require('../models/merchantInfo.model')
const Professionalinfo = require('../models/professionalInfo.model')
const Organizationinfo = require('../models/organizationInfo.model')
const User = require('../models/user.model')
const Userpayment = require('../models/userPayment.model')
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
    } = req.body

    // Validate required fields
    if (!userID || !amount) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing required fields' })
    }

    // Find user
    const user = await User.findOne({
      $or: [{ _id: userID }, { userId: userID }],
    })

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    // Check user payment method
    const userPayment = await Userpayment.findOne({ userID })
    if (!userPayment) {
      return res.status(400).json({
        success: false,
        error: 'User does not have a valid payment method',
      })
    }

    const { customerId, paymentMethodId } = userPayment

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
      seller = await Professionalinfo.findById(professionalID)
      sellerType = 'Professional'
    } else if (organizationID) {
      seller = await Organizationinfo.findById(organizationID)
      sellerType = 'Organization'
    } else {
      return res
        .status(400)
        .json({ success: false, error: 'No valid seller ID provided' })
    }

    // Validate seller existence
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, error: `${sellerType} not found` })
    }

    sellerID = seller._id
    sellerStripeAccountId = seller.stripeAccountId

    if (!sellerStripeAccountId) {
      return res.status(400).json({
        success: false,
        error: `${sellerType} does not have a connected Stripe account`,
      })
    }

    // Charge the customer
    const paymentIntent = await chargeCustomer(
      customerId,
      paymentMethodId,
      amount
    )
    console.log(paymentIntent, 'PaymentIntent created')

    if (paymentIntent.status === 'succeeded') {
      const vendorAmount = Math.round(amount * 0.9 * 100) // Vendor gets 90%

      // Transfer money to the seller
      const transfer = await stripe.transfers.create({
        amount: vendorAmount,
        currency: 'usd',
        destination: sellerStripeAccountId,
        transfer_group: `ORDER_${paymentIntent.id}`,
      })

      // Validate service booking time
      const bookingTime = serviceBookingTime
        ? new Date(serviceBookingTime)
        : null
      if (bookingTime && isNaN(bookingTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid service booking time format',
        })
      }

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
        serviceBookingTime: bookingTime,
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
        bookingTime: bookingTime,
      })
    } else {
      return res.status(400).json({ success: false, error: 'Payment failed' })
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed',
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

const webhookController = async (req, res) => {
  let event
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle different event types
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object // PaymentIntent object
    console.log('💰 Payment succeeded:', paymentIntent)
  }

  // Acknowledge receipt of the event
  res.status(200).send()
}

module.exports = {
  savePaymentMethod,
  purchaseMethod,
  webhookController,
  removePaymentMethod,
}
