const Merchanthelpandsupport = require("../models/merchantHelpAndSupport.model");

const getMerchantHelpAndSupports = async (req, res) => {
    try {
      const merchantHelpAndSupports = await Merchanthelpandsupport.find().populate('user'); // Populate the `user` field
      res.status(200).json(merchantHelpAndSupports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant help and supports", error });
    }
  };

  const getMerchantHelpAndSupportById = async (req, res) => {
    const { id } = req.params;
    try {
      const merchantHelpAndSupport = await Merchanthelpandsupport.findById(id).populate('user'); // Populate the `user` field
      if (!merchantHelpAndSupport) {
        return res.status(404).json({ message: "Merchant help and support not found" });
      }
      res.status(200).json(merchantHelpAndSupport);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant help and support", error });
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
      res.status(201).json(newMerchantHelpAndSupport);
    } catch (error) {
      res.status(500).json({ message: "Failed to create merchant help and support", error });
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
        return res.status(404).json({ message: "Merchant help and support not found" });
      }
      res.status(200).json(updatedMerchantHelpAndSupport);
    } catch (error) {
      res.status(500).json({ message: "Failed to update merchant help and support", error });
    }
  };


  const deleteMerchantHelpAndSupport = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedMerchantHelpAndSupport = await Merchanthelpandsupport.findByIdAndDelete(id);
      if (!deletedMerchantHelpAndSupport) {
        return res.status(404).json({ message: "Merchant help and support not found" });
      }
      res.status(200).json({ message: "Merchant help and support deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete merchant help and support", error });
    }
  };

  module.exports = {
    getMerchantHelpAndSupports,
    getMerchantHelpAndSupportById,
    createMerchantHelpAndSupport,
    updateMerchantHelpAndSupport,
    deleteMerchantHelpAndSupport,
  };