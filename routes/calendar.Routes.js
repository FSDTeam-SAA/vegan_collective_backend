const express = require("express");
const { nylas, nylasConfig } = require("../config/nylasConfig");
const router = express.Router();
const User = require("../models/user.model"); // Import your User model

router.get("/nylas/auth", (req, res) => {
  const email = req.query.email; // Extract userId from query parameters

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: nylasConfig.clientId,
    redirectUri: nylasConfig.redirectUri,
    loginHint: email, // Pass the userId as a login hint
  });

  res.redirect(authUrl); // Redirect the user to the Nylas authentication URL
});

router.get("/oauth/exchange", (req, res) => {
  const { code } = req.query; // Extract code and userId from query parameters

  if (!code) {
    return res.status(400).json({ error: "code are required" });
  }
  nylas.auth
    .exchangeCodeForToken({
      clientId: nylasConfig.clientId,
      clientSecret: nylasConfig.apiKey,
      redirectUri: nylasConfig.redirectUri,
      code: code,
    })
    .then(async (response) => {
      // Save the access token and userId to your database here
      const { grantId, email } = response;

      const user = User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Please Connect you account with your platform email",
        });
      }

      await User.findOneAndUpdate(
        { email: email },
        {
          grandId: grantId,
          grandEmail: email,
        },
        { new: true }
      );

      // save the grantId and email to grantEmail on User model

      res.json({
        message: "Calender connected successfully",
        accessToken: response.accessToken,
      });
    })
    .catch((error) => {
      console.error("Error exchanging code for token:", error);
      res.status(500).json({ error: "Failed to exchange code for token" });
    });
});

module.exports = router;
