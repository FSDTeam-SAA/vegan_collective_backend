const Merchantgolive = require('../models/merchantGoLive.model');
const mongoose = require('mongoose');
const { google } = require('googleapis');

// Initialize OAuth2 Client (if not already present)
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI || 'http://localhost:8001/auth/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        let { merchantID, eventTitle, description, date, time, eventType, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(merchantID)) {
            return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
        }

        if (eventType === 'free event') {
            price = undefined;
        }

        const newEvent = new Merchantgolive({
            merchantID,
            eventTitle,
            description,
            date,
            time,
            eventType,
            price
        });


        // calender event create

        

        await newEvent.save();
        res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all events
// merchantGoLive.controller.js
exports.getAllEvents = async (req, res) => {
    try {
      const events = await Merchantgolive.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: events.length,
        events: events.map(event => ({
          merchantID: event.merchantID,
          eventTitle: event.eventTitle,
          description: event.description,
          date: event.date,
          time: event.time,
          eventType: event.eventType,
          price: event.price,
          _id: event._id,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          meetLink: event.meetLink,
          calendarLink: event.calendarLink,
          
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  };

// Get all events for a merchant including Google Meet details
exports.getMerchantEvents = async (req, res) => {
    try {
      const { merchantID } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(merchantID)) {
        return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
      }
  
      const events = await Merchantgolive.find({ merchantID }).sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: events.length,
        events: events.map(event => ({
          merchantID: event.merchantID,
          eventTitle: event.eventTitle,
          description: event.description,
          date: event.date,
          time: event.time,
          eventType: event.eventType,
          price: event.price,
          _id: event._id,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          meetLink: event.meetLink,
          calendarLink: event.calendarLink,
         
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  };
  
  // Add Google Meet to an existing event
  exports.getAuthUrl = (req, res) => {
    try {
        const { merchantID } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(merchantID)) {
            return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
        }
        
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
            state: merchantID
        });
        
        // Instead of returning JSON, redirect directly
        res.redirect(authUrl);
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate authentication URL' 
        });
    }
};
  
  exports.addGoogleMeet = async (req, res) => {
    try {
      const { merchantID, _id } = req.params;
      const { token } = req.body;
  
      // Validations
      if (!mongoose.Types.ObjectId.isValid(merchantID) || !mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ success: false, message: 'Invalid IDs' });
      }
  
      if (!token) {
        return res.status(400).json({ success: false, message: 'Token required' });
      }
  
      // Find the event
      const event = await Merchantgolive.findOne({ 
        _id, 
        merchantID 
      });
  
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
  
      // Configure Google Calendar
      oauth2Client.setCredentials({ access_token: token });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
      // Create event time objects
      const startDateTime = new Date(`${event.date}T${event.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
  
      const googleEvent = {
        summary: event.eventTitle,
        description: event.description || '',
        start: { 
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        },
        end: { 
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(2, 15),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };
  
      // Create Google Calendar event
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: googleEvent,
        conferenceDataVersion: 1,
      });
  
      // Update our event
      event.meetLink = response.data.hangoutLink;
      event.calendarLink = response.data.htmlLink;
      event.eventId = response.data.id;
      await event.save();
  
      res.status(200).json({
        success: true,
        meetLink: response.data.hangoutLink,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        merchantID: merchantID
      });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        details: error.response?.data || null
      });
    }
  };
  
  exports.getMerchantMeetings = async (req, res) => {
    try {
      const { merchantID } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(merchantID)) {
        return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
      }
  
      const meetings = await Merchantgolive.find({ merchantID }).sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: meetings.length,
        meetings: meetings.map(m => ({
          merchantID: m.merchantID,
          eventTitle: m.eventTitle,
          description: m.description,
          date: m.date,
          time: m.time,
          eventType: m.eventType,
          price: m.price,
          meetLink: m.meetLink,
          calendarLink: m.calendarLink,
          _id: m._id,
          createdAt: m.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };
  
exports.handleAuthCallback = async (req, res) => {
  try {
    const { code, state: merchantID } = req.query;

    if (!code || !merchantID) {
      return res.status(400).send(`
        <html>
          <script>
            alert("Missing authorization code or merchant ID");
            window.close();
          </script>
        </html>
      `);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      return res.status(400).send(`
        <html>
          <script>
            alert("Failed to get access token");
            window.close();
          </script>
        </html>
      `);
    }

    // Send the token back to your frontend
    res.send(`
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            // Send token to the opener window
            if (window.opener) {
              window.opener.postMessage({
                type: 'google-auth-success',
                token: '${tokens.access_token}',
                merchantID: '${merchantID}'
              }, 'http://localhost:3000'); // Change to your frontend origin
            }
            window.close();
          </script>
        </head>
        <body>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Authentication Failed</title>
          <script>
            alert("Authentication failed: ${error.message.replace(/"/g, '\\"')}");
            window.close();
          </script>
        </head>
      </html>
    `);
  }
};
  

// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        const event = await Merchantgolive.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        let { eventTitle, description, date, time, eventType, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        let updateFields = { eventTitle, description, date, time, eventType };

        if (eventType === 'free event') {
            updateFields.price = null;
        } else {
            updateFields.price = price;
        }

        const updatedEvent = await Merchantgolive.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        const deletedEvent = await Merchantgolive.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get events by status (true/false)
exports.getEventsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (status !== 'true' && status !== 'false') {
            return res.status(400).json({ success: false, message: 'Invalid status value, must be "true" or "false"' });
        }

        const events = await Merchantgolive.find({ status: status === 'true' });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// New API to create Google Meet for an existing event
// exports.createGoogleMeet = async (req, res) => {
//     try {
//       const { eventId, token } = req.body;
  
//       if (!mongoose.Types.ObjectId.isValid(eventId)) {
//         return res.status(400).json({ success: false, message: 'Invalid event ID' });
//       }
  
//       if (!token) {
//         return res.status(400).json({ success: false, message: 'Authentication token required' });
//       }
  
//       // Find the existing event
//       const event = await Merchantgolive.findById(eventId);
//       if (!event) {
//         return res.status(404).json({ success: false, message: 'Event not found' });
//       }
  
//       // Parse existing date and time
//       const startDateTime = new Date(`${event.date}T${event.time}`);
//       const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1-hour duration
  
//       if (isNaN(startDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: 'Invalid date or time in event' });
//       }
  
//       // Set up Google Calendar API
//       oauth2Client.setCredentials({ access_token: token });
//       const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
//       const googleEvent = {
//         summary: event.eventTitle || 'Merchant Event',
//         description: event.description || '',
//         start: { 
//           dateTime: startDateTime.toISOString(),
//           timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
//         },
//         end: { 
//           dateTime: endDateTime.toISOString(),
//           timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
//         },
//         conferenceData: {
//           createRequest: {
//             requestId: Math.random().toString(36).substring(2, 15),
//             conferenceSolutionKey: { type: 'hangoutsMeet' }
//           }
//         }
//       };
  
//       // Create Google Calendar event
//       const calendarResponse = await calendar.events.insert({
//         calendarId: 'primary',
//         resource: googleEvent,
//         conferenceDataVersion: 1,
//       });
  
//       // Update the event with Google Meet details
//       event.meetLink = calendarResponse.data.hangoutLink;
//       event.calendarLink = calendarResponse.data.htmlLink;
//       event.eventId = calendarResponse.data.id;
  
//       await event.save();
  
//       res.status(200).json({
//         success: true,
//         message: 'Google Meet created successfully',
//         meetLink: calendarResponse.data.hangoutLink,
//         calendarLink: calendarResponse.data.htmlLink,
//         eventId: calendarResponse.data.id
//       });
//     } catch (error) {
//       console.error('Google Meet creation error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create Google Meet',
//         error: error.message
//       });
//     }
// };