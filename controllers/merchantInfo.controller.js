const Merchantinfo = require("../models/merchantInfo.model");

const getMerchantInfos = async (req, res) => {
    try {
      const merchantInfos = await Merchantinfo.find().populate('user'); // Populate the `user` field
      return res.status(200).json({
        status: true,
        data: merchantInfos
      });
    } catch (error) {
      return res.status(500).json({ 
        status:false,
        message: "Failed to fetch merchant infos", 
        data: error 
      });
    }
  };

  const getMerchantInfoById = async (req, res) => {
    const { id } = req.params;
    try {
      const merchantInfo = await Merchantinfo.findById(id).populate('user'); // Populate the `user` field
      if (!merchantInfo) {
        return res.status(404).json({ 
          status: false,
          message: "Merchant info not found" 
        });
      }
      return res.status(200).json({
        status:true,
        data: merchantInfo
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to fetch merchant info", 
        data: error 
      });
    }
  };

  const createMerchantInfo = async (req, res) => {
    const {
      user,
      businessName,
      address,
      aboutUs,
      websiteURL,
      governmentIssuedID,
      businessLicense,
      photoWithID,
    } = req.body;
    try {
      const newMerchantInfo = new Merchantinfo({
        user,
        businessName,
        address,
        aboutUs,
        websiteURL,
        governmentIssuedID,
        businessLicense,
        photoWithID,
      });
      await newMerchantInfo.save();
      return res.status(201).json({
        status: true,
        data: newMerchantInfo
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to create merchant info", 
        data: error 
      });
    }
  };


  const updateMerchantInfo = async (req, res) => {
    const { id } = req.params;
    const {
      user,
      businessName,
      address,
      aboutUs,
      websiteURL,
      governmentIssuedID,
      businessLicense,
      photoWithID,
    } = req.body;
    try {
      const updatedMerchantInfo = await Merchantinfo.findByIdAndUpdate(
        id,
        {
          user,
          businessName,
          address,
          aboutUs,
          websiteURL,
          governmentIssuedID,
          businessLicense,
          photoWithID,
        },
        { new: true }
      );
      if (!updatedMerchantInfo) {
        return res.status(404).json({ 
          status:false,
          message: "Merchant info not found" 
        });
      }
      return res.status(200).json({
        status: true,
        data: updatedMerchantInfo
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to update merchant info", 
        data: error
      });
    }
  };    


  const deleteMerchantInfo = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedMerchantInfo = await Merchantinfo.findByIdAndDelete(id);
      if (!deletedMerchantInfo) {
        return res.status(404).json({ 
          status: false,
          message: "Merchant info not found"
        });
      }
      return res.status(200).json({ 
        status:true,
        message: "Merchant info deleted successfully" 
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to delete merchant info", 
        data: error 
      });
    }
  };

  module.exports = {
    getMerchantInfos,
    getMerchantInfoById,
    createMerchantInfo,
    updateMerchantInfo,
    deleteMerchantInfo,
  };    