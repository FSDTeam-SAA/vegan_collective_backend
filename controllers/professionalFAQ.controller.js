const mongoose = require("mongoose");
const professionalFAQ = require("../models/professionalFAQ.model"); // Adjust the path as needed
const User = require("../models/user.model"); // Adjust the path as needed

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { userID, question, answer } = req.body;

    // Validate if userID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userID format",
      });
    }

    // Check if the user exists and has an account type of "professional"
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.accountType !== "professional") {
      return res.status(403).json({
        success: false,
        message: "This user is not a professional",
      });
    }

    // Create the FAQ entry
    const newFAQ = new professionalFAQ({
      userID,
      question,
      answer,
    });

    await newFAQ.save();

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: newFAQ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all FAQs (no userID required)
exports.getAllFAQs = async (req, res) => {
  try {
    // Fetch all FAQs from the database
    const faqs = await professionalFAQ.find();

    return res.status(200).json({
      success: true,
      message: "All FAQs retrieved successfully",
      data: faqs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific FAQ by ID
// Get FAQs by User ID
exports.getFAQsByUserID = async (req, res) => {
  try {
    const { userID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const faqs = await professionalFAQ.find({ userID });
    return res.status(200).json({ success: true, message: "FAQs retrieved successfully", data: faqs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Update an FAQ by userID and FAQ ID
// Update FAQs by User ID
exports.updateFAQsByID = async (req, res) => {
  try {
    const { id } = req.params; // Assuming `id` represents the `_id` of the FAQ document
    const { question, answer } = req.body;

    // Validate if the provided `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid FAQ ID format" });
    }

    // Update the FAQ document by its `_id`
    const updatedFAQ = await professionalFAQ.findByIdAndUpdate(
      id, // Use the `_id` to find the document
      { $set: { question, answer } }, // Update the fields
      { new: true } // Return the updated document
    );

    // If no document was found with the given `_id`
    if (!updatedFAQ) {
      return res.status(404).json({ success: false, message: "No FAQ found with this ID" });
    }

    // Return success response with the updated FAQ
    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: updatedFAQ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete an FAQ by ID
exports.deleteFAQsByID = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the provided `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid FAQ ID format" });
    }

    // Delete the FAQ document by its `_id`
    const deletedFAQ = await professionalFAQ.findByIdAndDelete(id);

    // If no document was found with the given `_id`
    if (!deletedFAQ) {
      return res.status(404).json({ success: false, message: "No FAQ found with this ID" });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
      data: deletedFAQ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};