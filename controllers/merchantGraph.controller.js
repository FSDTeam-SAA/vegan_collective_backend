const refferModel = require("../models/reffer.model");
const Userpayment = require("../models/userPayment.model");

    const getMonthlySalesAndEarnings = async (req, res) => {
        try {
          const productSales = await Userpayment.aggregate([
            {
              $group: {
                _id: { $month: "$createdAt" },
                totalSales: { $sum: "$amount" },
              },
            },
          ]);
      
          const referralEarnings = await refferModel.aggregate([
            {
              $group: {
                _id: { $month: "$createdAt" },
                totalEarnings: { $sum: { $add: ["$paid", "$remain"] } },
              },
            },
          ]);
      
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
      
          const salesMap = Object.fromEntries(
            productSales.map(({ _id, totalSales }) => [_id, totalSales])
          );
      
          const earningsMap = Object.fromEntries(
            referralEarnings.map(({ _id, totalEarnings }) => [_id, totalEarnings])
          );
      
          const result = months.map((month, index) => ({
            month,
            "Product Sales": salesMap[index + 1] || 0,
            "Referral Earnings": earningsMap[index + 1] || 0,
          }));

          return res.status(200).json({
            success : true,
            message : "data fetch successfully",
            data : result
          });
        } catch (error) {
            return res.status(500).json({
                success : false,
                message : error.message,
                data : []
              });
        }
      };

      module.exports = getMonthlySalesAndEarnings;