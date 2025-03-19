const Golive = require("../models/professionalGoLive.model");
const refferModel = require("../models/reffer.model");
const Userpayment = require("../models/userPayment.model");

const getProfessionalGraph = async (req, res) => {
    try {
      const serviceSales = await Userpayment.aggregate([
        { $match: { professionalServicesId: { $ne: null } } }, 
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalServiceSales: { $sum: "$amount" },
          },
        },
      ]);
  
      const referralEarnings = await refferModel.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalRefferEarnings: { $sum: { $add: ["$paid", "$remain"] } },
          },
        },
      ]);
  
      const goLiveEarnings = await Golive.aggregate([
        { $match: { eventType: "paid event" } }, 
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalGoLiveEarnings: { $sum: "$price" },
          },
        },
      ]);
  
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
  
      const serviceSalesMap = Object.fromEntries(
        serviceSales.map(({ _id, totalServiceSales }) => [_id, totalServiceSales])
      );
  
      const referralEarningsMap = Object.fromEntries(
        referralEarnings.map(({ _id, totalRefferEarnings }) => [_id, totalRefferEarnings])
      );
  
      const goLiveEarningsMap = Object.fromEntries(
        goLiveEarnings.map(({ _id, totalGoLiveEarnings }) => [_id, totalGoLiveEarnings])
      );
  
      const result = months.map((month, index) => ({
        month,
        service: serviceSalesMap[index + 1] || 0,
        reffer: referralEarningsMap[index + 1] || 0,
        GoLive: goLiveEarningsMap[index + 1] || 0,
      }));
  
      return res.status(200).json({
        success: true,
        data: result,
      });
  
    } catch (error) {
      console.error("Error fetching sales and earnings:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching monthly sales and earnings",
        data : []
      });
    }
  };
 

module.exports = getProfessionalGraph;