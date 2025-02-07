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

         // generate a verify token
         const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRETE || "secretkey", { expiresIn: '30d' })

         // send the verify email
         const mailOption = {
           from: process.env.EMAIL_USER,
           to: email,
           subject: 'Verify your email',
           html: `<p> Please click the following link to verify your email: </p>
            <a href="http://localhost:3000/verify-email/${verifyToken}">Verify Email</a>`,
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

module.exports ={
    userSignup
}