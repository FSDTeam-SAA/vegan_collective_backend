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

    // 3. Find all payments to determine the correct order numbers
    const allPayments = await Userpayment.find(paymentQuery)
      .sort({ createdAt: -1 })
      .lean();

    if (!allPayments || allPayments.length === 0) {
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

    // Create a map of payment IDs to their sequential order numbers
    const paymentOrderMap = {};
    allPayments.forEach((payment, index) => {
      paymentOrderMap[payment._id.toString()] = index + 1;
    });

    // 4. Get paginated payments
    const payments = await Userpayment.find(paymentQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const totalItems = await Userpayment.countDocuments(paymentQuery);

    // 5. Process each payment to get the required details
    const bookingDetails = await Promise.all(
      payments.map(async (payment) => {
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

        // Get the sequential order number from our map
        const orderNumber = paymentOrderMap[payment._id.toString()];

        const shippingInfo = {
          trackingNumber: deliveryInfo?.trackingNumber || "Not available",
          shippingStatus: deliveryInfo?.shipping || "pending",
        };

        return {
          orderId: payment._id.toString(),
          orderNo: `ORD-${orderNumber.toString().padStart(3, "0")}`,
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

    // 6. Apply search and filters
    let filteredResults = bookingDetails;

    // Search by orderNo, customerName, or orderId
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResults = filteredResults.filter(
        (item) =>
          item.orderNo.toLowerCase().includes(searchLower) ||
          item.customerName.toLowerCase().includes(searchLower) ||
          item.orderId.toLowerCase().includes(searchLower)
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

exports.updateBooking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, shippingStatus } = req.body;

    // Validate required fields
    // if (!trackingNumber || !shippingStatus) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Tracking number and shipping status are required",
    //   });
    // }

    // Validate shipping status
    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(shippingStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid shipping status. Must be one of: pending, shipped, delivered, cancelled",
      });
    }

    // Check if the payment exists and get its creation date
    const payment = await Userpayment.findById(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the merchant's product to get merchantID
    const product = await MerchantProducts.findById(payment.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product associated with this order not found",
      });
    }

    // Find or create delivery info
    let deliveryInfo = await Merchantproductdelivary.findOne({
      merchantID: product.merchantID,
      orderDetail: orderId,
    });

    if (deliveryInfo) {
      // Update existing delivery info
      deliveryInfo.trackingNumber = trackingNumber;
      deliveryInfo.shipping = shippingStatus;
    } else {
      // Create new delivery info
      deliveryInfo = new Merchantproductdelivary({
        merchantID: product.merchantID,
        orderDetail: orderId,
        trackingNumber,
        shipping: shippingStatus,
      });
    }

    await deliveryInfo.save();

    // Get the correct orderNo by counting how many orders were created before this one
    const ordersBeforeThis = await Userpayment.countDocuments({
      productId: product._id,
      status: "confirmed",
      createdAt: { $lt: payment.createdAt },
    });

    // const orderNo = `ORD-${(ordersBeforeThis + 1).toString().padStart(3, "0")}`;

    res.status(200).json({
      success: true,
      message: "Order tracking information updated successfully",
      data: {
        // orderNo,
        orderId,
        trackingNumber,
        shippingStatus,
        updatedAt: deliveryInfo.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

//   try {
//       const { orderId } = req.params; // Changed from merchantID to orderId in params
//       const { trackingNumber, shippingStatus = 'pending' } = req.body;

//       // Validate input
//       if (!orderId) {
//           return res.status(400).json({
//               success: false,
//               message: 'orderId is required in URL params',
//               data: null
//           });
//       }

//       if (!trackingNumber) {
//           return res.status(400).json({
//               success: false,
//               message: 'trackingNumber is required in request body',
//               data: null
//           });
//       }

//       // 1. Find the payment first
//       const payment = await Userpayment.findById(orderId);

//       if (!payment) {
//           return res.status(404).json({
//               success: false,
//               message: 'Order not found',
//               data: null
//           });
//       }

//       // 2. Verify the product belongs to the merchant
//       const product = await MerchantProducts.findOne({
//           _id: payment.productId,
//           merchantID: payment.merchantID // Assuming payment has merchantID
//       });

//       if (!product) {
//           return res.status(403).json({
//               success: false,
//               message: 'Product does not belong to this merchant',
//               data: null
//           });
//       }

//       // 3. Update or create delivery info
//       const deliveryInfo = await Merchantproductdelivary.findOneAndUpdate(
//           {
//               orderDetail: payment._id
//           },
//           {
//               trackingNumber,
//               shipping: shippingStatus,
//               merchantID: payment.merchantID // Ensure merchantID is set
//           },
//           {
//               upsert: true,
//               new: true
//           }
//       );

//       res.status(200).json({
//           success: true,
//           message: 'Tracking updated successfully',
//           data: {
//               orderId: payment._id,
//               orderNo: `ORD-${payment.orderNumber}`, // Add if available
//               trackingNumber: deliveryInfo.trackingNumber,
//               shippingStatus: deliveryInfo.shipping,
//               merchantID: payment.merchantID
//           }
//       });

//   } catch (error) {
//       console.error('Tracking update error:', error);
//       res.status(500).json({
//           success: false,
//           message: 'Failed to update tracking',
//           error: error.message,
//           data: null
//       });
//   }
// };

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
