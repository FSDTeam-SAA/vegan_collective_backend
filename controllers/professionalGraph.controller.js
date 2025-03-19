const { default: mongoose } = require("mongoose");
const Golive = require("../models/professionalGoLive.model");
const refferModel = require("../models/reffer.model");
const Userpayment = require("../models/userPayment.model");
const Professionalinfo = require("../models/professionalInfo.model");

// const getProfessionalGraph = async (req, res) => {
//     try {
//       const serviceSales = await Userpayment.aggregate([
//         { $match: { professionalServicesId: { $ne: null } } }, 
//         {
//           $group: {
//             _id: { $month: "$createdAt" },
//             totalServiceSales: { $sum: "$amount" },
//           },
//         },
//       ]);
  
//       const referralEarnings = await refferModel.aggregate([
//         {
//           $group: {
//             _id: { $month: "$createdAt" },
//             totalRefferEarnings: { $sum: { $add: ["$paid", "$remain"] } },
//           },
//         },
//       ]);
  
//       const goLiveEarnings = await Golive.aggregate([
//         { $match: { eventType: "paid event" } }, 
//         {
//           $group: {
//             _id: { $month: "$createdAt" },
//             totalGoLiveEarnings: { $sum: "$price" },
//           },
//         },
//       ]);
  
//       const months = [
//         "January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"
//       ];
  
//       const serviceSalesMap = Object.fromEntries(
//         serviceSales.map(({ _id, totalServiceSales }) => [_id, totalServiceSales])
//       );
  
//       const referralEarningsMap = Object.fromEntries(
//         referralEarnings.map(({ _id, totalRefferEarnings }) => [_id, totalRefferEarnings])
//       );
  
//       const goLiveEarningsMap = Object.fromEntries(
//         goLiveEarnings.map(({ _id, totalGoLiveEarnings }) => [_id, totalGoLiveEarnings])
//       );
  
//       const result = months.map((month, index) => ({
//         month,
//         service: serviceSalesMap[index + 1] || 0,
//         reffer: referralEarningsMap[index + 1] || 0,
//         GoLive: goLiveEarningsMap[index + 1] || 0,
//       }));
  
//       return res.status(200).json({
//         success: true,
//         data: result,
//       });
  
//     } catch (error) {
//       console.error("Error fetching sales and earnings:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Server error while fetching monthly sales and earnings",
//         data : []
//       });
//     }
//   };
 
const getProfessionalGraph = async (req, res) => {
  try {
    const  {professionalID}  = req.params; 

    if (!professionalID) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required",
        data: []
      });
    }

    const isExist = await Professionalinfo.find({userId : professionalID});
    if (!isExist) {
      return res.status(404).json({
          success: false,
          message: "Professional not found",
          data: []
      })
    }

    const serviceSales = await Userpayment.aggregate([
      { 
        $match: { 
          professionalServicesId: new mongoose.Types.ObjectId(professionalID) 
        } 
      }, 
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalServiceSales: { $sum: "$amount" },
        },
      },
    ]);

    const referralEarnings = await refferModel.aggregate([
      { 
        $match: { creator: new mongoose.Types.ObjectId(professionalID) } } ,
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRefferEarnings: { $sum: { $add: ["$paid", "$remain"] } },
        },
      },
    ]);

    const goLiveEarnings = await Golive.aggregate([
      { 
        $match: { 
          userID: new mongoose.Types.ObjectId(professionalID),
          eventType: "paid event"
        } 
      }, 
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
      data: []
    });
  }
};

module.exports = getProfessionalGraph;