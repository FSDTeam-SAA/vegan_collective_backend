const Merchanthelpandsupport = require("../models/merchantHelpAndSupport.model");

const getMerchantHelpAndSupports = async (req, res) => {
    try {
      const merchantHelpAndSupports = await Merchanthelpandsupport.find().populate('user'); // Populate the `user` field
      return res.status(200).json({
        status: true,
        data: merchantHelpAndSupports
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to fetch merchant help and supports", 
        data: error 
      });
    }
  };

  const getMerchantHelpAndSupportById = async (req, res) => {
    const { id } = req.params;
    try {
      const merchantHelpAndSupport = await Merchanthelpandsupport.findById(id).populate('user'); // Populate the `user` field
      if (!merchantHelpAndSupport) {
        return res.status(404).json({ 
          status: false,
          message: "Merchant help and support not found" 
        });
      }
      return res.status(200).json({
        status:true,
        data: merchantHelpAndSupport
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to fetch merchant help and support", 
        data: error 
      });
    }
  };

  const createMerchantHelpAndSupport = async (req, res) => {
    const {
      user,
      slug,
      subject,
      message,
      status,
    } = req.body;
    try {
      const newMerchantHelpAndSupport = new Merchanthelpandsupport({
        user,
        slug,
        subject,
        message,
        status,
      });
      await newMerchantHelpAndSupport.save();
      return res.status(201).json({
        status:true,
        data: newMerchantHelpAndSupport
      });
    } catch (error) {
      return res.status(500).json({ 
        status:false,
        message: "Failed to create merchant help and support", 
        data: error 
      });
    }
  };


  const updateMerchantHelpAndSupport = async (req, res) => {
    const { id } = req.params;
    const {
      user,
      slug,
      subject,
      message,
      status,
    } = req.body;
    try {
      const updatedMerchantHelpAndSupport = await Merchanthelpandsupport.findByIdAndUpdate(
        id,
        {
          user,
          slug,
          subject,
          message,
          status,
        },
        { new: true }
      );
      if (!updatedMerchantHelpAndSupport) {
        return res.status(404).json({ 
          status: false,
          message: "Merchant help and support not found" 
        });
      }
      return res.status(200).json({
        status: true,
        data: updatedMerchantHelpAndSupport
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to update merchant help and support", 
        data: error 
      });
    }
  };


  const deleteMerchantHelpAndSupport = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedMerchantHelpAndSupport = await Merchanthelpandsupport.findByIdAndDelete(id);
      if (!deletedMerchantHelpAndSupport) {
        return res.status(404).json({ 
          status: false,
          message: "Merchant help and support not found" 
        });
      }
      return res.status(200).json({ 
        stutus: true,
        message: "Merchant help and support deleted successfully" 
      });
    } catch (error) {
      return res.status(500).json({ 
        status:false,
        message: "Failed to delete merchant help and support", 
        data: error 
      });
    }
  };

  module.exports = {
    getMerchantHelpAndSupports,
    getMerchantHelpAndSupportById,
    createMerchantHelpAndSupport,
    updateMerchantHelpAndSupport,
    deleteMerchantHelpAndSupport,
  };