const Userpayment = require('../models/user.model')

const checkUserPayment = async (req, res) => {
  try {
    const { userID } = req.body

    if (!userID) {
      return res
        .status(400)
        .json({ status: false, message: 'userID is required' })
    }

    const userPayment = await Userpayment.findOne({ userID })

    if (userPayment) {
      return res
        .status(200)
        .json({ status: true, message: 'User payment record exists' })
    } else {
      return res
        .status(404)
        .json({ status: false, message: 'User payment record not found' })
    }
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: false, message: 'Internal server error' })
  }
}

module.exports = { checkUserPayment }
