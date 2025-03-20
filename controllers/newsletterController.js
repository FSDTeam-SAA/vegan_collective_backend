const Subscriber = require("../models/Subscriber");
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  try {
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ success: false, message: "Already subscribed" });
    }

    subscriber = new Subscriber({ email });
    await subscriber.save();
    res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Unsubscribe a User
exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    const subscriber = await Subscriber.findOneAndDelete({ email });
    if (!subscriber) {
      return res.status(400).json({ success: false, message: "Email not found" });
    }

    res.status(200).json({ success: true, message: "Unsubscribed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Send Newsletter
exports.sendNewsletter = async (req, res) => {
  const { subject, message } = req.body;
  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: "No subscribers found" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: subscribers.map(sub => sub.email),
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Newsletter sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error sending email" });
  }
};