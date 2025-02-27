const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const savePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, customerId } = req.body

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
    })
    res.status(200).json({
      status: true,
      message: "Payment method saved successfully",
    })
  } catch (error) {
     console.error('Error saving payment method:', error)
     res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  savePaymentMethod
}