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

// Subscribe a User
exports.subscribe = async (req, res) => {
  const { email } = req.body;
  try {
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) return res.status(400).json({ message: "Already subscribed" });

    subscriber = new Subscriber({ email });
    await subscriber.save();
    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Unsubscribe a User
exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    const subscriber = await Subscriber.findOneAndDelete({ email });
    if (!subscriber) return res.status(400).json({ message: "Email not found" });

    res.status(200).json({ message: "Unsubscribed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Send Newsletter
exports.sendNewsletter = async (req, res) => {
  const { subject, message } = req.body;
  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) return res.status(400).json({ message: "No subscribers found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: subscribers.map(sub => sub.email),
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Newsletter sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error sending email" });
  }
};
