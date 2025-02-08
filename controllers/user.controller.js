const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../utility/emailSender");

const userSignup = async (req, res) => {
  const {
    joinAs,
    accountType,
    fullName,
    email,
    password,
    image,
  } = req.body;
  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'User already exists',
      })
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      joinAs,
      accountType,
      fullName,
      email,
      password: hashPassword,
      image,
      verifyEmail: false,
    })

    // generate a verify token
    const verifyToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRETE || 'thisisasecret',
      { expiresIn: '30d' }
    )

    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Vegan Collective',
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <h1 style="color: #2c5282; text-align: center;">Welcome to Vegan Collective!</h1>
      <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Thank you for joining us! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:8001/api/v1/verify-email?token=${verifyToken}" 
             style="background-color: #48bb78; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;
                    display: inline-block;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: background-color 0.3s ease;">
            Verify Email
          </a>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">If you didn't create an account, please ignore this email.</p>
      </div>
    </div>
  `,
    }

    await sendEmail(mailOption)

    res.status(201).json({
      status: true,
      message: "User created successfully. Please check your email to verify your account.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: error.message,
    })
  }
}

const verifyEmail = async (req, res) => {
  const { token } = req.query

  try {
    // verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRETE || 'thisisasecret'
    )
    const userId = decoded.userId

    // update the verifyEmail 
    const user = await User.findByIdAndUpdate(userId, { verifyEmail: true }, { new: true })
    console.log(user)
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      })

    }

    res.redirect(
      `${process.env.FONTEND_URL}/profile-setup?type=${user.accountType}`
    )
    console.log('this is the user', user.accountType)

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      })
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: 'Invalid password',
      })
    }

    // Check if the email is verified
    if (!user.verifyEmail) {
      return res.status(401).json({
        status: false,
        message: 'Email not verified. Please verify your email to log in.',
      })
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'thisisasecret',
      {
        expiresIn: '30d',
      }
    )

    // Set the token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })

    // Respond with success message and user data
    res.status(200).json({
      status: true,
      message: 'User logged in successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        joinAs: user.joinAs,
        image: user.image,
      },
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: error.message,
    })
  }
}

const logoutUser = (req, res) => {
  res.clearCookie('token')
  res.status(200).json({
    status: true,
    message: 'User logged out successfully',
  })
}

module.exports = {
  userSignup,
  verifyEmail,
  loginUser,
  logoutUser,
}