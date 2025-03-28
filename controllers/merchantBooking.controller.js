const Userpayment = require("../models/userPayment.model");
const User = require("../models/user.model");
const MerchantProducts = require("../models/merchantProducts.model");
const ProfessionalInfo = require("../models/professionalInfo.model");
const MerchantInfo = require("../models/merchantInfo.model");
const Merchantproductdelivary = require("../models/merchantProductDelivary.model");

// exports.getMerchantBookings = async (req, res) => {
//     try {
//       const { merchantID } = req.params;

//       // 1. Find all products belonging to this merchant
//       const products = await MerchantProducts.find({ merchantID });

//       if (!products || products.length === 0) {
//         return res.status(200).json({
//           success: true,
//           message: 'No products found for this merchant',
//           data: []
//         });
//       }

//       const productIds = products.map(p => p._id);

//       // 2. Find all payments that include any of these product IDs
//       const payments = await Userpayment.find({
//         productId: { $in: productIds },
//         status: 'confirmed'
//       }).sort({ createdAt: 1 });

//       if (!payments || payments.length === 0) {
//         return res.status(200).json({
//           success: true,
//           message: 'No confirmed bookings found for merchant products',
//           data: []
//         });
//       }

//       // 3. Process each payment to get the required details
//       const bookingDetails = await Promise.all(payments.map(async (payment, index) => {
//         // Get customer name from multiple possible sources
//         let customerName = 'Unknown Customer';

//         // First try User collection
//         const user = await User.findById(payment.userID).select('fullName');
//         if (user && user.fullName) {
//           customerName = user.fullName;
//         } else {
//           // If not found in User, try ProfessionalInfo
//           const professional = await ProfessionalInfo.findOne({ userId: payment.userID });
//           if (professional && professional.fullName) {
//             customerName = professional.fullName;
//           } else {
//             // If still not found, try MerchantInfo
//             const merchant = await MerchantInfo.findOne({ userId: payment.userID });
//             if (merchant && merchant.fullName) {
//               customerName = merchant.fullName;
//             }
//           }
//         }

//         // Get shipping information from Merchantproductdelivary
//         const deliveryInfo = await Merchantproductdelivary.findOne({
//           merchantID: merchantID,
//           orderDetail: payment._id
//         });

//         return {
//           orderNo: `ORD-${(index + 1).toString().padStart(3, '0')}`,
//           customerName,
//           orderDate: payment.createdAt.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//           }),
//           amount: payment.amount,
//           trackingNumber: deliveryInfo?.trackingNumber || 'Not available',
//           shippingStatus: deliveryInfo?.shipping || 'pending'
//         };
//       }));

//       res.status(200).json({
//         success: true,
//         message: 'Merchant bookings retrieved successfully',
//         // count: bookingDetails.length,
//         data: bookingDetails
//       });
//     } catch (error) {
//       console.error('Error fetching merchant bookings:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve merchant bookings',
//         error: error.message,
//         data: null
//       });
//     }
//   };

// controllers/booking.controller.js

exports.getMerchantBookings = async (req, res) => {
  try {
    const { merchantID } = req.params;
    const {
      search = "",
      shippingStatus = "all",
      page = 1,
      limit = 10,
    } = req.query;

    // Validate pagination parameters
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, Math.min(parseInt(limit), 100));
    const skip = (parsedPage - 1) * parsedLimit;

    // 1. Find all products belonging to this merchant
    const products = await MerchantProducts.find({ merchantID });

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found for this merchant",
        data: [],
        pagination: {
          currentPage: parsedPage,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parsedLimit,
        },
      });
    }

    const productIds = products.map((p) => p._id);

    // 2. Build base query for payments
    const paymentQuery = {
      productId: { $in: productIds },
      status: "confirmed",
    };

    // 3. Find payments with pagination
    const paymentsQuery = Userpayment.find(paymentQuery)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parsedLimit);

    const countQuery = Userpayment.countDocuments(paymentQuery);

    const [payments, totalItems] = await Promise.all([
      paymentsQuery.exec(),
      countQuery.exec(),
    ]);

    if (!payments || payments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No confirmed bookings found for merchant products",
        data: [],
        pagination: {
          currentPage: parsedPage,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parsedLimit,
        },
      });
    }

    // 4. Process each payment to get the required details
    const bookingDetails = await Promise.all(
      payments.map(async (payment, index) => {
        // Get customer name from multiple possible sources
        let customerName = "Unknown Customer";

        const user = await User.findById(payment.userID).select("fullName");
        if (user?.fullName) customerName = user.fullName;
        else {
          const professional = await ProfessionalInfo.findOne({
            userId: payment.userID,
          });
          if (professional?.fullName) customerName = professional.fullName;
          else {
            const merchant = await MerchantInfo.findOne({
              userId: payment.userID,
            });
            if (merchant?.fullName) customerName = merchant.fullName;
          }
        }

        // Get shipping information
        const deliveryInfo = await Merchantproductdelivary.findOne({
          merchantID: merchantID,
          orderDetail: payment._id,
        });

        const globalIndex = skip + index;
        const shippingInfo = {
          trackingNumber: deliveryInfo?.trackingNumber || "Not available",
          shippingStatus: deliveryInfo?.shipping || "pending",
        };

        return {
          orderNo: `ORD-${(globalIndex + 1).toString().padStart(3, "0")}`,
          customerName,
          orderDate: payment.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          amount: payment.amount,
          ...shippingInfo,
        };
      })
    );

    // 5. Apply search and filters
    let filteredResults = bookingDetails;

    // Search by orderNo or customerName
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResults = filteredResults.filter(
        (item) =>
          item.orderNo.toLowerCase().includes(searchLower) ||
          item.customerName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by shipping status
    if (shippingStatus !== "all") {
      filteredResults = filteredResults.filter(
        (item) => item.shippingStatus === shippingStatus
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / parsedLimit);
    const filteredCount = filteredResults.length;
    const pagination = {
      currentPage: parsedPage,
      totalPages,
      totalItems,
      itemsPerPage: parsedLimit,
      filteredCount,
    };

    res.status(200).json({
      success: true,
      message: "Merchant bookings retrieved successfully",
      data: filteredResults,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching merchant bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve merchant bookings",
      error: error.message,
      data: null,
      pagination: null,
    });
  }
};

exports.updateTrackingNumber = async (req, res) => {
  try {
    const { merchantID } = req.params;
    const { orderNo, trackingNumber, shippingStatus = "pending" } = req.body;

    // Validate input
    if (!orderNo) {
      return res.status(400).json({
        success: false,
        message: "orderNo is required",
        data: null,
      });
    }

    // 1. Find the merchant's products first
    const products = await MerchantProducts.find({ merchantID });
    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this merchant",
        data: null,
      });
    }

    const productIds = products.map((p) => p._id);

    // 2. Find the payment that matches:
    // - Belongs to merchant's products
    // - Has matching orderNo (ORD-001 format)
    const payments = await Userpayment.find({
      productId: { $in: productIds },
      status: "confirmed",
    }).sort({ createdAt: 1 });

    // Find the specific payment by its index (ORD-001 = index 0)
    const orderIndex = parseInt(orderNo.split("-")[1]) - 1;
    const payment = payments[orderIndex];

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this merchant",
        data: null,
      });
    }

    // 3. Update or create delivery info
    const deliveryInfo = await Merchantproductdelivary.findOneAndUpdate(
      {
        merchantID: merchantID,
        orderDetail: payment._id,
      },
      {
        trackingNumber,
        shipping: shippingStatus,
        orderNo: orderNo,
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      data: {
        orderNo,
        trackingNumber: deliveryInfo.trackingNumber,
        shippingStatus: deliveryInfo.shipping,
        merchantID: merchantID,
      },
    });
  } catch (error) {
    console.error("Tracking update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tracking",
      error: error.message,
      data: null,
    });
  }
};

//   try {
//     const { merchantID } = req.params;

//     // 1. Find all products belonging to this merchant
//     const products = await MerchantProducts.find({ merchantID });

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: 'No products found for this merchant' });
//     }

//     const productIds = products.map(p => p._id);

//     // 2. Find all payments that include any of these product IDs
//     const payments = await Userpayment.find({
//       productId: { $in: productIds },
//       status: 'confirmed'
//     }).sort({ createdAt: 1 });

//     if (!payments || payments.length === 0) {
//       return res.status(404).json({ message: 'No bookings found for this merchant\'s products' });
//     }

//     // 3. Process each payment to get the required details
//     const bookingDetails = await Promise.all(payments.map(async (payment, index) => {
//       // Get customer name from multiple possible sources
//       let customerName = 'Unknown Customer';

//       // First try User collection
//       const user = await User.findById(payment.userID).select('fullName');
//       if (user && user.fullName) {
//         customerName = user.fullName;
//       } else {
//         // If not found in User, try ProfessionalInfo
//         const professional = await ProfessionalInfo.findOne({ userId: payment.userID });
//         if (professional && professional.fullName) {
//           customerName = professional.fullName;
//         } else {
//           // If still not found, try MerchantInfo
//           const merchant = await MerchantInfo.findOne({ userId: payment.userID });
//           if (merchant && merchant.fullName) {
//             customerName = merchant.fullName;
//           }
//         }
//       }

//       // Get the first product details (even if multiple products in payment)
//       const product = await MerchantProducts.findById(payment.productId[0]);

//       return {
//         orderNo: `ORD-${(index + 1).toString().padStart(3, '0')}`,
//         customerName,
//         orderDate: payment.createdAt.toLocaleDateString(),
//         amount: payment.amount,
//         productName: product ? product.productName : 'Unknown Product'
//       };
//     }));

//     res.status(200).json(bookingDetails);
//   } catch (error) {
//     console.error('Error fetching merchant bookings:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.getMerchantBookings = async (req, res) => {
//     try {
//       const { merchantID } = req.params;

//       // 1. First find all products belonging to this merchant
//       const products = await MerchantProducts.find({ merchantID });

//       if (!products || products.length === 0) {
//         return res.status(404).json({ message: 'No products found for this merchant' });
//       }

//       const productIds = products.map(p => p._id);

//       // 2. Find all payments that include any of these product IDs
//       const payments = await Userpayment.find({
//         productId: { $in: productIds },
//         status: 'confirmed'
//       }).sort({ createdAt: 1 });

//       if (!payments || payments.length === 0) {
//         return res.status(404).json({ message: 'No bookings found for this merchant\'s products' });
//       }

//       // 3. Process each payment to get the required details
//       const bookingDetails = await Promise.all(payments.map(async (payment, index) => {
//         // Get user details
//         const user = await User.findById(payment.userID).select('fullName');

//         // Get the first product details (even if multiple products in payment)
//         const product = await MerchantProducts.findById(payment.productId[0]);

//         return {
//           orderNo: `ORD-${(index + 1).toString().padStart(3, '0')}`,
//           customerName: user ? user.fullName : 'Unknown Customer',
//           orderDate: payment.createdAt.toLocaleDateString(),
//           amount: payment.amount,
//           productName: product ? product.productName : 'Unknown Product'
//         };
//       }));

//       res.status(200).json(bookingDetails);
//     } catch (error) {
//       console.error('Error fetching merchant bookings:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   };
