const FAQ = require("../models/FAQ.model");

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Validate request body
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Both 'question' and 'answer' fields are required.",
      });
    }

    const newFAQ = new FAQ({ question, answer });
    const savedFAQ = await newFAQ.save();

    res.status(201).json({
      success: true,
      message: "FAQ created successfully.",
      data: savedFAQ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "FAQs retrieved successfully.",
      data: faqs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Get a single FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully.",
      data: faq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Update an FAQ by ID
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    // Validate request body
    if (!question && !answer) {
      return res.status(400).json({
        success: false,
        message: "At least one field ('question' or 'answer') must be provided.",
      });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully.",
      data: updatedFAQ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Delete an FAQ by ID
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFAQ = await FAQ.findByIdAndDelete(id);

    if (!deletedFAQ) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully.",
      data: deletedFAQ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};