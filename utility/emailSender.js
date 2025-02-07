const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
})

const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

module.exports = { sendEmail }