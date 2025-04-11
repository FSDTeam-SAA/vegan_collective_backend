const Merchantinfo = require("../models/merchantInfo.model");
const Organizationinfo = require("../models/organizationInfo.model");
const Professionalinfo = require("../models/professionalInfo.model");
const User = require("../models/user.model");
const Userpayment = require('../models/userPayment.model');
const mongoose = require("mongoose");

const verifierCreate = async (req, res) => {
  try {
    const { email } = req.body;

    const isExist = await User.findOne({ email });

    if (!isExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: [],
      });
    }

    isExist.role = "verifier";
    await isExist.save();

    return res.status(201).json({
      success: true,
      message: `role of ${email} has been changed to verifier`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsersForSuperAdmin = async (req, res) => {
  try {
    const { country, state, city, page = 1, limit = 10 } = req.query;

    const query = { role: "user" };
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (pageNumber - 1) * itemsPerPage;

    const [totalItems, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).skip(skip).limit(itemsPerPage),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      meta: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllMerchantsForSuperAdmin = async (req, res) => {
  try {
    const { country, state, city, page = 1, limit = 10 } = req.query;

    const query = {};
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (pageNumber - 1) * itemsPerPage;

    const [totalItems, users] = await Promise.all([
      Merchantinfo.countDocuments(query),
      Merchantinfo.find(query).skip(skip).limit(itemsPerPage),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return res.status(200).json({
      success: true,
      message: "Merchants fetched successfully",
      data: users,
      meta: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProfessionalsForSuperAdmin = async (req, res) => {
  try {
    const { country, state, city, page = 1, limit = 10 } = req.query;

    const query = {};
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (pageNumber - 1) * itemsPerPage;

    const [totalItems, users] = await Promise.all([
      Professionalinfo.countDocuments(query),
      Professionalinfo.find(query).skip(skip).limit(itemsPerPage),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return res.status(200).json({
      success: true,
      message: "Professionals fetched successfully",
      data: users,
      meta: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllOrganizationsForSuperAdmin = async (req, res) => {
  try {
    const { country, state, city, page = 1, limit = 10 } = req.query;

    const query = {};
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (pageNumber - 1) * itemsPerPage;

    const [totalItems, users] = await Promise.all([
      Organizationinfo.countDocuments(query),
      Organizationinfo.find(query).skip(skip).limit(itemsPerPage),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return res.status(200).json({
      success: true,
      message: "Organizations fetched successfully",
      data: users,
      meta: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVerifiersForSuperAdmin = async (req, res) => {
    try {
      const { country, state, city, page = 1, limit = 10 } = req.query;
  
      const query = { role: "verifier" };
      if (country) query.country = country;
      if (state) query.state = state;
      if (city) query.city = city;
  
      const pageNumber = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (pageNumber - 1) * itemsPerPage;
  
      const [totalItems, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query).skip(skip).limit(itemsPerPage),
      ]);
  
      const totalPages = Math.ceil(totalItems / itemsPerPage);
  
      return res.status(200).json({
        success: true,
        message: "Verifiers fetched successfully",
        data: users,
        meta: {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          itemsPerPage,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  const getVendorVerificationCounts = async (req, res) => {
    try {
      const { country, state, city } = req.query;
  
      // Build query for vendors
      const query = { role: "vendor" };
      if (country) query.country = country;
      if (state) query.state = state;
      if (city) query.city = city;
  
      // Get counts and earnings concurrently
      const [approvedCount, pendingCount, paymentData] = await Promise.all([
        User.countDocuments({ ...query, isVerified: "approved" }),
        User.countDocuments({ ...query, isVerified: "pending" }),
        Userpayment.aggregate([
          {
            $match: {
              status: "confirmed"
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              platformEarnings: { $sum: { $multiply: ["$amount", 0.1] } }
            }
          }
        ])
      ]);
  
      // Extract earnings data
      const earningsData = paymentData.length > 0 ? paymentData[0] : {
        totalAmount: 0,
        platformEarnings: 0
      };

      return res.status(200).json({
        success: true,
        message: "Vendor verification counts and earnings fetched successfully",
        data: {
          verifiedVendors: approvedCount,
          pendingVerifications: pendingCount,
          totalEarnings: earningsData.totalAmount,
          platformEarnings: earningsData.platformEarnings
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  verifierCreate,
  getAllUsersForSuperAdmin,
  getAllMerchantsForSuperAdmin,
  getAllProfessionalsForSuperAdmin,
  getAllOrganizationsForSuperAdmin,
  getAllVerifiersForSuperAdmin,
  getVendorVerificationCounts,
};
