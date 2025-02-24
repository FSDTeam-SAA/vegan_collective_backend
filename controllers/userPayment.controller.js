const Userpayment = require('../models/userPayment.model.js')
const User = require('../models/user.model.js')

/**
 * Create a new user payment record.
 */
const createUserPayment = async (req, res) => {
  try {
    const { userID, methodTitle, methodString } = req.body

    // Verify if the user exists
    const userExists = await User.findById(userID)
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Create the payment methods array
    const paymentMethods = [{ methodTitle, methodString }]
    const newUserPayment = new Userpayment({
      userID,
      paymentString: paymentMethods,
    })

    // Save the new user payment record
    const savedUserPayment = await newUserPayment.save()
    return res.status(201).json({ success: true, savedUserPayment })
  } catch (error) {
    console.error('Error creating user payment:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' })
  }
}

/**
 * Retrieve payment information for a given user by their ID.
 */
const getUserPaymentByUserId = async (req, res) => {
  try {
    const userID = req.params.userID
    const userPayment = await Userpayment.find({ userID })

    if (!userPayment || userPayment.length === 0) {
      return res.status(404).json({ error: 'User payment not found' })
    }

    return res.status(200).json({ success: true, userPayment })
  } catch (error) {
    console.error('Error fetching user payment:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' })
  }
}

/**
 * Update an existing user payment record.
 */
const updateUserPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { userID, methodTitle, methodString } = req.body

    // Check if the user exists
    const userExists = await User.findById(userID)
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' })
    }

    const paymentMethods = [{ methodTitle, methodString }]
    const updatedUserPayment = await Userpayment.findByIdAndUpdate(
      id,
      { userID, paymentString: paymentMethods },
      { new: true }
    )

    if (!updatedUserPayment) {
      return res.status(404).json({ error: 'User payment not found' })
    }

    return res.status(200).json({ success: true, updatedUserPayment })
  } catch (error) {
    console.error('Error updating user payment:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' })
  }
}

/**
 * Delete a user payment record.
 */
const deleteUserPayment = async (req, res) => {
  try {
    const { id } = req.params
    const deletedUserPayment = await Userpayment.findByIdAndDelete(id)

    if (!deletedUserPayment) {
      return res.status(404).json({ error: 'User payment not found' })
    }

    return res.status(200).json({ success: true, deletedUserPayment })
  } catch (error) {
    console.error('Error deleting user payment:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' })
  }
}

module.exports = {
  createUserPayment,
  getUserPaymentByUserId,
  updateUserPayment,
  deleteUserPayment,
}
