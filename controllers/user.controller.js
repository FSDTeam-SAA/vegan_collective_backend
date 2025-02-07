const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../utility/emailSender"); 

const userSignup = async (req, res)=>{
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
           password : hashPassword,
           image,
           verifyEmail: false,
         })
         console.log(process.env.JWT_SECRET)

         // generate a verify token
         const verifyToken = jwt.sign(
           { userId: user._id },
           process.env.JWT_SECRETE || 'thisisasecret',
           { expiresIn: '30d' }
         )
         
         // send the verify email
        const mailOption = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your email___',
          html: `<p>Please click the following link to verify your email:</p>
         <a href="http://localhost:8001/api/v1/verify-email?token=${verifyToken}">Verify Email</a>`,
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

const verifyEmail = async (req,res)=>{
    const { token } = req.query
    console.log("this is the token__",token)

    try {
        // verify the token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRETE || 'thisisasecret'
        )
        const userId = decoded.userId

        // update the verifyEmail 
        const user = await User.findByIdAndUpdate(userId, {verifyEmail: true}, {new: true})
        console.log(user)
        if(!user){
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

module.exports = {
  userSignup,
  verifyEmail,
}