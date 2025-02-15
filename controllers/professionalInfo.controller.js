const Professionalinfo = require("../models/professionalInfo.model");

// Create a new professional info
exports.createProfessionalInfo = async (req, res) => {
  try {
    const professionalInfo = new Professionalinfo(req.body);
    const savedInfo = await professionalInfo.save();
    res.status(201).json({
      success: true,
      message: "Professional info created successfully",
      data: savedInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating professional info",
      error: error.message,
    });
  }
};

// Get all professional info
exports.getAllProfessionalInfo = async (req, res) => {
  try {
    const professionalInfoList = await Professionalinfo.find();
    res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfoList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};

// Get a single professional info by ID
exports.getProfessionalInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalInfo = await Professionalinfo.findById(id);
    if (!professionalInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Professional info retrieved successfully",
      data: professionalInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving professional info",
      error: error.message,
    });
  }
};

// Update professional info by ID
exports.updateProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = await Professionalinfo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Professional info updated successfully",
      data: updatedInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating professional info",
      error: error.message,
    });
  }
};

// Delete professional info by ID
exports.deleteProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Professionalinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res.status(404).json({
        success: false,
        message: "Professional info not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Professional info deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting professional info",
      error: error.message,
    });
  }
};