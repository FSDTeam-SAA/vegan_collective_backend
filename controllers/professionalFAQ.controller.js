const Professionalfaq = require('../models/professionalFAQ.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Import the Professionalinfo model

// Create a new FAQ entry
exports.createFAQ = async (req, res) => {
  try {
    const { professionalID, question, answer } = req.body;

    // Validate required fields
    if (!professionalID || !question || !answer) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    // Check if the professionalID exists in the Professionalinfo collection
    const professionalExists = await Professionalinfo.findById(professionalID);
    if (!professionalExists) {
      return res.status(400).json({
        status: false,
        message: "Invalid professionalID. Only valid professionals can create FAQs.",
      });
    }

    // If professionalID is valid, proceed to create the FAQ
    const newFAQ = new Professionalfaq({
      professionalID,
      question,
      answer,
    });

    const savedFAQ = await newFAQ.save();
    return res.status(201).json({
      status: true,
      message: "FAQ created successfully",
      data: savedFAQ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Get all FAQ entries
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await Professionalfaq.find().populate('professionalID');
    return res.status(200).json({
      status: true,
      message: "FAQs retrieved successfully",
      data: faqs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Get FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await Professionalfaq.findById(req.params.id).populate('professionalID');
    if (!faq) {
      return res.status(404).json({
        status: false,
        message: "FAQ not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Update FAQ by ID
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Check if the FAQ exists
    const faq = await Professionalfaq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        status: false,
        message: "FAQ not found",
      });
    }

    // Update the FAQ
    const updatedFAQ = await Professionalfaq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "FAQ updated successfully",
      data: updatedFAQ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Delete FAQ by ID
exports.deleteFAQ = async (req, res) => {
  try {
    const deletedFAQ = await Professionalfaq.findByIdAndDelete(req.params.id);
    if (!deletedFAQ) {
      return res.status(404).json({
        status: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};