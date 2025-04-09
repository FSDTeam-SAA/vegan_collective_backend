const express = require("express");
const { nylas, nylasConfig } = require("../config/nylasConfig");
const router = express.Router();
const User = require("../models/user.model"); // Import your User model

router.get("/nylas/auth", (req, res) => {
  const email = req.query.email; // Extract userId from query parameters
  const redirectTo = req.query.redirectTo; // Extract redirectTo from query parameters
  const userId = req.query.userId; // Extract userId from query parameters

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: nylasConfig.clientId,
    redirectUri: `${process.env.BACKEND_URL}/api/oauth/exchange`,
    loginHint: email, // Pass the userId as a login hint
    state: `redirectTo=${redirectTo}&userId=${userId}`, // Pass the redirectTo parameter in the state
  });

  res.redirect(authUrl); // Redirect the user to the Nylas authentication URL
});

router.get("/oauth/exchange", (req, res) => {
  const { code, state } = req.query; // Extract code and userId from query parameters\

  const userId = state.split("&")[1].split("=")[1]; // Extract the userId from the state parameter

  const redirectToUrl = state.split("&")[0].split("=")[1]; // Extract the redirectTo URL from the state parameter

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

      const user = User.findOne({ _id: userId });
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

      res.redirect(`${process.env.FONTEND_URL}/${redirectToUrl}`);
    })
    .catch((error) => {
      console.error("Error exchanging code for token:", error);
      res.status(500).json({ error: "Failed to exchange code for token" });
    });
});

router.get("/checkCalendar", (req, res) => {
  const userId = req.query.userId; // Extract userId from query parameters

  if (!userId) {
    return res
      .status(400)
      .json({ message: "userId is required", success: false });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", success: false });
      }

      if (!user.grandEmail) {
        return res
          .status(400)
          .json({ error: "Calendar not connected", success: false });
      }

      res.status(200).json({ success: true, message: "Calendar connected" });
    })
    .catch((error) => {
      console.error("Error checking calendar connection:", error);
      res.status(500).json({ error: "Failed to check calendar connection" });
    });
});

module.exports = router;
