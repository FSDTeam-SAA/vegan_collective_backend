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
exports.getFAQByID = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if FAQ ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID format",
      });
    }

    // Find the FAQ entry
    const faq = await professionalFAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update an FAQ by ID
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    // Validate if FAQ ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID format",
      });
    }

    // Find the FAQ entry
    const faq = await professionalFAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    // Update the FAQ entry
    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete an FAQ by ID
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if FAQ ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID format",
      });
    }

    // Find and delete the FAQ entry
    const faq = await professionalFAQ.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};