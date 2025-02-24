const User = require('../models/user.model'); // Import User model

exports.findByAccountTypeOrId = async (req, res) => {
  try {
    const { accountType, userID } = req.query; // Get query params

    // Validate accountType
    if (!accountType || !userID) {
      return res.status(400).json({
        success: false,
        message: "Both accountType and userID are required in the query.",
      });
    }

    if (!["merchant", "professional", "organization"].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accountType. Allowed values: merchant, professional, organization.",
      });
    }

    // Find user by accountType and userID
    const user = await User.findOne({ _id: userID, accountType });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with accountType: ${accountType} and userID: ${userID}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User found with accountType: ${accountType} and userID: ${userID}`,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
