const Merchantgolive = require("../models/merchantGoLive.model");

// create merchant go live
const createMerchantGoLive = async (req, res) => {
  try {
    const { user, eventTitle, description, date, time, eventType, price } =
      req.body;
    const merchantGoLive = await Merchantgolive.create({
      user,
      eventTitle,
      description,
      date,
      time,
      eventType,
      price,
    });
    return res.status(201).json({
      status: true,
      message: "live event for merchant created successfully ",
      data: merchantGoLive,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// update merchant go live
const updateMerchantGoLive = async (req, res) => {
  try {
    const { user, eventTitle, description, date, time, eventType, price } =
      req.body;
    const { id } = req.params;
    const merchantGoLiveFound = await Merchantgolive.findById({ _id: id });
    if (!merchantGoLiveFound) {
      return res.status(404).json({
        status: false,
        message: "no merchant go live event exist with this id",
      });
    }

    const updatedMerchantGoLive = {
      user: user || merchantGoLiveFound.user,
      eventTitle: eventTitle || merchantGoLiveFound.eventTitle,
      description: description || merchantGoLiveFound.description,
      date: date || merchantGoLiveFound.date,
      time: time || merchantGoLiveFound.time,
      eventType: eventType || merchantGoLiveFound.merchantGoLiveFound,
      price: price || merchantGoLiveFound.price,
    };

    const merchantGoLive = await Merchantgolive.findByIdAndUpdate(
      { _id: id },
      updatedMerchantGoLive,
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "merchant go live updated successfully",
      data: merchantGoLive,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// get all merchant go live
const getAllMerchantGoLive = async (req, res) => {
  try {
    const allMerchantGoLive = await Merchantgolive.find({});
    return res.status(200).json({
      status: true,
      message: "all merchant go live event fetch successfully",
      data: allMerchantGoLive,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// get specific merchant go live
const getSpecificMerchantGoLive = async (req, res) => {
  try {
    const { id } = req.params;

    const merchantGoLiveExist = await Merchantgolive.findById({ _id: id });

    if (!merchantGoLiveExist) {
      return res.status(400).json({
        status: false,
        message: "no merchant go live event exist with this id",
      });
    }

    return res.status(200).json({
      status: true,
      message: "all merchant go live event fetch successfully",
      data: merchantGoLiveExist,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// delete merchant go live
const deleteMerchantGoLive = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantGoLiveExist = await Merchantgolive.findById({ _id: id });

    if (!merchantGoLiveExist) {
      return res.status(400).json({
        status: false,
        message: "no merchant go live event exist with this id",
      });
    }

    await Merchantgolive.findByIdAndDelete({ _id: id });
    return res.status({
      status: true,
      message: "merchant go live event deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

module.exports = {
  createMerchantGoLive,
  updateMerchantGoLive,
  getAllMerchantGoLive,
  getSpecificMerchantGoLive,
  deleteMerchantGoLive,
};
