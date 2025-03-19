const Event = require('../models/Event');

const nodemailer = require('nodemailer');

// Setup email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ datetime: 1 });
        res.json({ success: true, message: 'Events fetched successfully', data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { email, title, datetime, type } = req.body;

        if (!email || !title || !datetime || !type) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const event = new Event({
            email,
            title,
            datetime: new Date(datetime),
            type: type === 'remainder' ? 'reminder' : type,
        });

        await event.save();

        const eventTime = new Date(event.datetime).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = eventTime - currentTime - 60000; // 1 minute before

        if (timeDifference > 0) {
            setTimeout(() => {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: event.email,
                    subject: `Reminder: ${event.title}`,
                    text: `Dear User,\n\nThis is a reminder for your upcoming ${event.type}:\n\nTitle: ${event.title}\nTime: ${new Date(event.datetime).toLocaleString()}\n\nBest regards,\nYour Calendar App`,
                };

                // Ensure transporter is accessible here
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Email error:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            }, timeDifference);
        }

        res.status(201).json({ success: true, message: 'Event created successfully', data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
    }
};

module.exports = { getEvents, createEvent };