const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();


let accessToken = null;
let refreshToken = null;
let tokenExpiryTime = null;


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


       accessToken = response.data.access_token;
       refreshToken = response.data.refresh_token;
       tokenExpiryTime = Date.now() + response.data.expires_in * 1000; // Convert to milliseconds


       console.log('Initial Refresh Token:', refreshToken); // Log the initial refresh token


       // Start the token refresh loop
       startTokenRefreshLoop(response.data.expires_in * 1000);


       res.send(`Access Token: ${accessToken}`);
   } catch (error) {
       console.error('Error during Zoom OAuth callback:', error);
       res.status(500).send('Internal Server Error');
   }
};


// Function to refresh the access token
const refreshAccessToken = async () => {
   try {
       const params = new URLSearchParams();
       params.append('grant_type', 'refresh_token');
       params.append('refresh_token', refreshToken);


       const authHeader = `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`;
       const response = await axios.post('https://zoom.us/oauth/token', params, {
           headers: {
               'Authorization': authHeader,
               'Content-Type': 'application/x-www-form-urlencoded'
           }
       });


       accessToken = response.data.access_token;
       refreshToken = response.data.refresh_token;
       tokenExpiryTime = Date.now() + response.data.expires_in * 1000; // Convert to milliseconds


       console.log('Access token refreshed');
       console.log('New Access Token:', accessToken); // Log the new access token
       console.log('New Refresh Token:', refreshToken); // Log the new refresh token
   } catch (error) {
       console.error('Error refreshing access token:', error);
   }
};


// Function to start the token refresh loop
const startTokenRefreshLoop = (expiresIn) => {
   setInterval(async () => {
       if (Date.now() >= tokenExpiryTime - 60000) { // Refresh token 1 minute before expiry
           await refreshAccessToken();
       }
   }, expiresIn - 60000); // Check every (expiresIn - 1 minute)
};


// Middleware to ensure the access token is valid
const ensureValidToken = async (req, res, next) => {
   if (!accessToken || Date.now() >= tokenExpiryTime) {
       await refreshAccessToken();
   }
   next();
};


// Example: Create a Zoom meeting
exports.createMeeting = async (req, res) => {
   try {
       const meetingData = {
           topic: req.body.topic || 'My Zoom Meeting',
           type: 2, // Scheduled meeting
           start_time: req.body.start_time || '2023-10-15T10:00:00',
           duration: req.body.duration || 60,
           timezone: req.body.timezone || 'UTC',
       };


       const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
           headers: {
               'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json',
           },
       });


       res.status(201).json(response.data);
   } catch (error) {
       console.error('Error creating meeting:', error.response?.data || error.message);
       res.status(500).send('Failed to create meeting');
   }
};

