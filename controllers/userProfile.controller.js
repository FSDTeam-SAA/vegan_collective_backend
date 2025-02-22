const User = require("../models/user.model");

const userProfile = async (req, res) => {
  try {
    const userID = req.params.id;
    const updatedData = req.body;

    // Validate user ID and check if the user exists and is professional
    const user = await User.findById(userID);
    if (!user || user.role !== "user") {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID or account type",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: updatedData },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      error: "Data updated",
      details: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
};

module.exports = userProfile;
