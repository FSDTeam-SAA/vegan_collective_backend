const express = require("express");
const { nylas, nylasConfig } = require("../config/nylasConfig");
const router = express.Router();
const User = require("../models/user.model"); // Import your User model

router.get("/nylas/auth", (req, res) => {
  const userId = req.query.userId; // Extract userId from query parameters

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  console.log("User ID:", userId); // Log the userId for debugging

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: nylasConfig.clientId,
    redirectUri: `${process.env.BACKEND_URL}/api/v1/oauth/exchange?userId=${userId}`,
  });

  res.redirect(authUrl); // Redirect the user to the Nylas authentication URL
});

router.get("/oauth/exchange", (req, res) => {
  const { code, userId } = req.query; // Extract code and userId from query parameters

  if (!code || !userId) {
    return res.status(400).json({ error: "code and userId are required" });
  }
  nylas.auth
    .exchangeCodeForToken(code, {
      clientId: nylasConfig.clientId,
      clientSecret: nylasConfig.apiKey,
      redirectUri: `${process.env.BACKEND_URL}/api/v1/oauth/exchange?userId=${userId}`,
      code: code,
    })
    .then(async (response) => {
      // Save the access token and userId to your database here
      console.log("Access Token:", response.accessToken);
      console.log("User ID:", userId);
      const { grantId, email } = response;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          grantId: grantId,
          grantEmail: email,
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

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
