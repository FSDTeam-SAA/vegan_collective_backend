const twilio = require("twilio");
const Sms = require("../models/smsModel");

const sendSms = async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, error: "Phone number and message are required." });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Use Twilio phone number
      to,
    });

    // Save the SMS data to the database
    const newSms = new Sms({
      to,
      message,
      twilioSid: response.sid, // Store the SID returned by Twilio
      status: response.status,
    });

    await newSms.save();

    res.status(200).json({ success: true, data: response.sid });
  } catch (error) {
    console.error("Twilio Error:", error); // Logs errors in the console
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { sendSms };
