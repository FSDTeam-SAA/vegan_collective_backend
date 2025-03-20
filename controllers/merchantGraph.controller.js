const mongoose = require("mongoose"); // Import mongoose
const refferModel = require("../models/reffer.model");
const Userpayment = require("../models/userPayment.model");
const MerchantProducts = require("../models/merchantProducts.model"); // Import MerchantProducts model

const getMonthlySalesAndEarnings = async (req, res) => {
  try {
    const { userID } = req.params; // Assuming userID and merchantID are the same

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
