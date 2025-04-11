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
        const { country, state, city, timeFilter = "lifetime" } = req.query;

        // Function to calculate date ranges
        const getDateRange = (filter) => {
            const now = new Date();
            const start = new Date();
            let end = new Date();

            switch(filter) {
                case "1months":
                    // Current month (1st to last day)
                    start.setDate(1);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case "3months":
                    start.setMonth(now.getMonth() - 3);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case "6months":
                    start.setMonth(now.getMonth() - 6);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case "1year":
                    start.setFullYear(now.getFullYear() - 1);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case "lifetime":
                    return {}; // No date filter
                default:
                    throw new Error("Invalid time filter. Use: 1month, 3months, 6months, 1year, or lifetime");
            }
            return { $gte: start, $lte: end };
        };

        const dateRange = getDateRange(timeFilter);

        // Build base queries for vendors
        const vendorQuery = { role: "vendor" };
        if (country) vendorQuery.country = country;
        if (state) vendorQuery.state = state;
        if (city) vendorQuery.city = city;

        // Add date filter if not lifetime
        const vendorDateQuery = timeFilter !== "lifetime" 
            ? { ...vendorQuery, createdAt: dateRange } 
            : vendorQuery;

        // Build payment match query
        const paymentMatch = { status: "confirmed" };
        if (timeFilter !== "lifetime") {
            paymentMatch.createdAt = dateRange;
        }

        // Get counts and earnings concurrently
        const [approvedCount, pendingCount, paymentData] = await Promise.all([
            User.countDocuments({ ...vendorDateQuery, isVerified: "approved" }),
            User.countDocuments({ ...vendorDateQuery, isVerified: "pending" }),
            Userpayment.aggregate([
                {
                    $match: paymentMatch
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
                platformEarnings: earningsData.platformEarnings,
                timePeriod: timeFilter,
                // dateRange: timeFilter !== "lifetime" ? {
                //     start: dateRange.$gte,
                //     end: dateRange.$lte
                // } : null
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
