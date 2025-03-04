const User = require('../models/user.model')
const Userpayment =  require('../models/userPayment.model')
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
      userID, // Ensure this matches your schema (check your model)
      customerId,
      paymentMethodId,
    })

    console.log('Saving payment entry:', paymentEntry)

    await paymentEntry.save()

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

const chargeCustomer = async (customerId, paymentMethodId, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: 'https://yourwebsite.com/payment-success',
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating PaymentIntent:', error)
    throw error
  }
}

const purchaseMethod = async (req, res) => {
  try {
    const { userID, amount, sellerStripeAccountId } =
      req.body

    if (!customerId || !paymentMethodId || !amount || !sellerStripeAccountId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const paymentIntent = await chargeCustomer(
      customerId,
      paymentMethodId,
      amount
    )

    if (paymentIntent.status === 'succeeded') {
      // Calculate the 90% share for the vendor
      const vendorAmount = Math.round(amount * 0.9 * 100) // Convert to cents

      // Create a transfer to the vendor's Stripe account
      const transfer = await stripe.transfers.create({
        amount: vendorAmount,
        currency: 'usd',
        destination: sellerStripeAccountId,
        transfer_group: `ORDER_${paymentIntent.id}`,
      })

      return res.status(200).json({
        success: true,
        message: 'Payment processed and transferred successfully',
        paymentIntentId: paymentIntent.id,
        transferId: transfer.id,
        amountReceived: paymentIntent.amount_received,
        transferredAmount: vendorAmount / 100,
      })
    } else {
      return res.status(400).json({ error: 'Payment failed' })
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return res.status(500).json({ error: 'Payment processing failed' })
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
}