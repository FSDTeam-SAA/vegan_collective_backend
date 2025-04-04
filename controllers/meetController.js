const { google } = require('googleapis');
const Meeting = require('../models/Meeting');
const Merchantgolive = require('../models/merchantGoLive.model');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI || 'http://localhost:8001/auth/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

module.exports = {
  getAuthUrl: (req, res) => {
    try {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ error: 'Failed to generate authentication URL' });
    }
  },

  handleAuthCallback: async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) throw new Error('Authorization code missing');

      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }
      
      res.redirect(`/meet.html?token=${tokens.access_token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).send(`<script>
        alert("Authentication failed: ${error.message.replace(/"/g, '\\"')}");
        window.location.href = "/";
      </script>`);
    }
  },

  createMeeting: async (req, res) => {
    try {
      const { token, summary, startTime, endTime } = req.body;
      
      if (!token) throw new Error('Missing access token');
      if (!startTime || !endTime) throw new Error('Missing time parameters');
      
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime())) throw new Error('Invalid start time');
      if (isNaN(end.getTime())) throw new Error('Invalid end time');
      if (start >= end) throw new Error('End time must be after start time');

      oauth2Client.setCredentials({ access_token: token });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: summary || 'Google Meet Meeting',
        start: { 
          dateTime: start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        },
        end: { 
          dateTime: end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(2, 15),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const meeting = new Meeting({
        title: summary || 'Google Meet Meeting',
        startTime: start,
        endTime: end,
        meetLink: response.data.hangoutLink,
        calendarLink: response.data.htmlLink,
        eventId: response.data.id
      });

      await meeting.save();

      res.json({ 
        success: true,
        meetLink: response.data.hangoutLink,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      });

    } catch (error) {
      console.error('Meeting creation error:', error);
      const statusCode = error.code === 401 ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        details: error.response?.data || null
      });
    }
  },

  getMeetings: async (req, res) => {
    try {
      const meetings = await Meeting.find().sort({ createdAt: -1 });
      
      const formattedMeetings = meetings.map(meeting => ({
        ...meeting._doc,
        startTime: meeting.startTime.toISOString(),
        endTime: meeting.endTime.toISOString(),
        createdAt: meeting.createdAt.toISOString()
      }));
      
      res.json({ 
        success: true,
        count: meetings.length,
        meetings: formattedMeetings
      });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch meetings',
        details: error.message
      });
    }
  }
};