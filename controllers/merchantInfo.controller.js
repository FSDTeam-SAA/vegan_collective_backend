const Merchantinfo = require("../models/merchantInfo.model");

const getMerchantInfos = async (req, res) => {
    try {
      const merchantInfos = await Merchantinfo.find().populate('user'); // Populate the `user` field
      res.status(200).json(merchantInfos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant infos", error });
    }
  };

  const getMerchantInfoById = async (req, res) => {
    const { id } = req.params;
    try {
      const merchantInfo = await Merchantinfo.findById(id).populate('user'); // Populate the `user` field
      if (!merchantInfo) {
        return res.status(404).json({ message: "Merchant info not found" });
      }
      res.status(200).json(merchantInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant info", error });
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
      res.status(201).json(newMerchantInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to create merchant info", error });
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
        return res.status(404).json({ message: "Merchant info not found" });
      }
      res.status(200).json(updatedMerchantInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update merchant info", error });
    }
  };    


  const deleteMerchantInfo = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedMerchantInfo = await Merchantinfo.findByIdAndDelete(id);
      if (!deletedMerchantInfo) {
        return res.status(404).json({ message: "Merchant info not found" });
      }
      res.status(200).json({ message: "Merchant info deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete merchant info", error });
    }
  };

  module.exports = {
    getMerchantInfos,
    getMerchantInfoById,
    createMerchantInfo,
    updateMerchantInfo,
    deleteMerchantInfo,
  };    