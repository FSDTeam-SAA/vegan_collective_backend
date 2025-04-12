const Organizationfundraisingmanagement = require("../models/organizationFundraisingManagement.model");

// Create a new fundraising campaign
exports.createCampaign = async (req, res) => {
  try {
    const { organizationID, campaignTitle, description, fundraisingGoal, deadline } = req.body;
    const newCampaign = new Organizationfundraisingmanagement({
      organizationID,
      campaignTitle,
      description,
      fundraisingGoal,
      achieved: 0, // Initially, the achieved amount is 0
      deadline,
    });
    const savedCampaign = await newCampaign.save();
    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: savedCampaign,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all fundraising campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Organizationfundraisingmanagement.find().populate("organizationID");

    // Map through the campaigns and format the response
    const formattedCampaigns = campaigns.map((campaign) => {
      const percentageValue = Math.round((campaign.achieved / campaign.fundraisingGoal) * 100); // Round to nearest integer
      const percentage = `${percentageValue}%`; // Add % symbol
      return {
        id: campaign._id,
        campaignTitle: campaign.campaignTitle,
        description: campaign.description,
        fundraisingGoal: campaign.fundraisingGoal,
        achieved: campaign.achieved,
        deadline: campaign.deadline,
        percentage: percentage, // Add formatted percentage
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        __v: campaign.__v,
      };
    });

    res.status(200).json({
      success: true,
      message: "Campaigns retrieved successfully",
      data: formattedCampaigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all fundraising campaigns by organization ID
exports.getCampaignsByOrganizationID = async (req, res) => {
  try {
    const { organizationID } = req.params;

    // Find all campaigns that belong to the specified organization ID
    const campaigns = await Organizationfundraisingmanagement.find({ organizationID }).populate("organizationID");

    // Map through the campaigns and format the response
    const formattedCampaigns = campaigns.map((campaign) => {
      const percentageValue = Math.round((campaign.achieved / campaign.fundraisingGoal) * 100); // Round to nearest integer
      const percentage = `${percentageValue}%`; // Add % symbol
      return {
        id: campaign._id,
        campaignTitle: campaign.campaignTitle,
        description: campaign.description,
        fundraisingGoal: campaign.fundraisingGoal,
        achieved: campaign.achieved,
        deadline: campaign.deadline,
        percentage: percentage, // Add formatted percentage
        __v: campaign.__v,
      };
    });

    res.status(200).json({
      success: true,
      message: "Campaigns retrieved successfully",
      data: formattedCampaigns || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get a single fundraising campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Organizationfundraisingmanagement.findById(req.params.id).populate("organizationID");
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Campaign retrieved successfully",
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a fundraising campaign by ID
exports.updateCampaign = async (req, res) => {
  try {
    const { campaignTitle, description, fundraisingGoal, achieved, deadline } = req.body;

    // Update the campaign
    const updatedCampaign = await Organizationfundraisingmanagement.findByIdAndUpdate(
      req.params.id,
      { campaignTitle, description, fundraisingGoal, achieved, deadline },
      { new: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Calculate the percentage of the fundraising goal achieved and round it to the nearest integer
    const percentageValue = Math.round((updatedCampaign.achieved / updatedCampaign.fundraisingGoal) * 100);
    const percentage = `${percentageValue}%`; // Add the % symbol

    // Add the percentage to the response
    const response = {
      ...updatedCampaign.toObject(), // Convert Mongoose document to a plain object
      percentage: percentage, // Add formatted percentage
    };

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a fundraising campaign by ID
exports.deleteCampaign = async (req, res) => {
  try {
    const deletedCampaign = await Organizationfundraisingmanagement.findByIdAndDelete(req.params.id);
    if (!deletedCampaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};