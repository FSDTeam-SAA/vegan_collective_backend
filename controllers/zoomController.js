const axios = require('axios');
const mongoose = require('mongoose');
const Meeting = require('../models/meeting.model');

// Redirect to Zoom OAuth URL
exports.getOAuthUrl = (req, res) => {
  const redirectUri = encodeURIComponent(process.env.ZOOM_REDIRECT_URI);
  const scopes = encodeURIComponent('meeting:read:admin meeting:write:admin'); // Add your scopes here
  const url = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes}`;
  res.redirect(url);
};

// Handle Zoom OAuth callback
exports.handleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
      return res.status(400).send('Code not found');
  }

  try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', process.env.ZOOM_REDIRECT_URI);

      const authHeader = `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`;
      const response = await axios.post('https://zoom.us/oauth/token', params, {
          headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });

      const accessToken = response.data.access_token;
      res.send(`Access Token: ${accessToken}`);
  } catch (error) {
      console.error('Error during Zoom OAuth callback:', error);
      res.status(500).send('Internal Server Error');
  }
};

// Example: Create a Zoom meeting
exports.createMeeting = async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
  if (!accessToken) {
      return res.status(401).send('Access token is required');
  }

  try {
      const meetingData = {
          topic: 'My Zoom Meeting',
          type: 2, // Scheduled meeting
          start_time: '2023-10-15T10:00:00',
          duration: 60,
          timezone: 'UTC',
      };

      const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
          },
      });

      // Check if the meeting ID already exists
      const existingMeeting = await Meeting.findOne({ zoomId: response.data.id });
      if (!existingMeeting) {
          await new Meeting({
              zoomId: response.data.id,
              meetingId: response.data.id, // Ensure meetingId is set
              startUrls: [response.data.start_url],
              joinUrls: [response.data.join_url]
          }).save();
      } else {
          // Append new links to existing meeting
          await Meeting.updateOne(
              { zoomId: response.data.id },
              { 
                  $push: { 
                      startUrls: response.data.start_url, 
                      joinUrls: response.data.join_url 
                  } 
              }
          );
      }

      res.status(201).json(response.data);
  } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      res.status(500).send('Failed to create meeting');
  }
};
