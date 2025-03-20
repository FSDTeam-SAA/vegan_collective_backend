const mongoose = require("mongoose"); // Import mongoose
const refferModel = require("../models/reffer.model");
const Userpayment = require("../models/userPayment.model");
const MerchantProducts = require("../models/merchantProducts.model"); // Import MerchantProducts model

const getMonthlySalesAndEarnings = async (req, res) => {
  try {
    const { userID } = req.params; // Assuming userID and merchantID are the same
    const { filter } = req.query; // Get filter type (12months, 3months, 30days, 7days, 24days)

    // Determine the date range based on filter
    let startDate = new Date();
    switch (filter) {
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "24days":
        startDate.setDate(startDate.getDate() - 24);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 12); // Default to 12 months
    }

    // Fetch all products owned by the merchant (userID)
    const merchantProducts = await MerchantProducts.find({ merchantID: userID }).select("_id");
    const merchantProductIds = merchantProducts.map((product) => product._id);

    // Fetch product sales for the specified userID/merchantID and sellerType: "Merchant"
    const productSales = await Userpayment.aggregate([
      {
        $match: {
          $or: [
            { sellerID: new mongoose.Types.ObjectId(userID), sellerType: "Merchant" }, // Direct sales
            { productId: { $in: merchantProductIds } }, // Sales of products owned by merchant
          ],
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    // Fetch referral earnings for the specified creator (userID)
    const referralEarnings = await refferModel.aggregate([
      {
        $match: {
          creator: new mongoose.Types.ObjectId(userID), // Filter by creator (userID)
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalEarnings: { $sum: { $add: ["$paid", "$remain"] } }, // Sum paid and remain
        },
      },
    ]);

    // Map months to their names
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Create maps for sales and earnings
    const salesMap = Object.fromEntries(
      productSales.map(({ _id, totalSales }) => [_id, totalSales])
    );

    const earningsMap = Object.fromEntries(
      referralEarnings.map(({ _id, totalEarnings }) => [_id, totalEarnings])
    );

    // Combine results
    const result = months.map((month, index) => ({
      month,
      "Product Sales": salesMap[index + 1] || 0,
      "Referral Earnings": earningsMap[index + 1] || 0,
    }));

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
  }
};

module.exports = getMonthlySalesAndEarnings;
