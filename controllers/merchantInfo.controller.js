const mongoose = require("mongoose");
const Merchantinfo = require("../models/merchantInfo.model");
const User = require("../models/user.model");
const upload = require("../utils/multerConfig");
const Professionalinfo = require("../models/professionalInfo.model");
const Organizationinfo = require("../models/organizationInfo.model");
const Userpayment = require("../models/userPayment.model");
const Reffer = require("../models/reffer.model");
const Merchantproductsreview = require("../models/merchantProductsReview.model");
exports.createMerchantInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error uploading file to Cloudinary" });
      }

      let {
        userID,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours,
        highlightedStatement,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userID format" });
      }

      const userExists = await User.findById(userID);
      if (!userExists) {
        return res
          .status(404)
          .json({ success: false, message: "User does not exist" });
      }

      const existingMerchantInfo = await Merchantinfo.findOne({ userID });
      if (existingMerchantInfo) {
        return res.status(400).json({
          success: false,
          message: "Merchant info already exists for this user",
        });
      }

      let parsedBusinessHours = [];
      let parsedHighlightedStatement = [];

      try {
        if (businessHours) parsedBusinessHours = JSON.parse(businessHours);
        if (highlightedStatement)
          parsedHighlightedStatement = JSON.parse(highlightedStatement);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid JSON format for businessHours or highlightedStatement",
        });
      }

      const profilePhotoUrl = req.file ? req.file.path : null;

      const newMerchantInfo = new Merchantinfo({
        userID,
        profilePhoto: profilePhotoUrl,
        fullName,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours: parsedBusinessHours,
        highlightedStatement: parsedHighlightedStatement,
        websiteURL,
        governmentIssuedID,
        professionalCertification,
        photoWithID,
        isVerified,
      });

      const savedMerchantInfo = await newMerchantInfo.save();
      res.status(201).json({
        success: true,
        message: "Merchant info created successfully",
        data: savedMerchantInfo,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating merchant info",
      error: error.message,
    });
  }
};

exports.getAllMerchantInfo = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      sortBy = "fullName",
      order = "asc",
      fullName,
      businessName,
      address,
    } = req.query;

    const filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (businessName)
      filter.businessName = { $regex: businessName, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const merchantInfoList = await Merchantinfo.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Unwind the userDetails array
      },
      {
        $addFields: {
          country: "$userDetails.country",
          state: "$userDetails.state",
          city: "$userDetails.city",
        },
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalDocuments = await Merchantinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Merchant info retrieved successfully",
      data: merchantInfoList,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalDocuments,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving merchant info",
      error: error.message,
    });
  }
};

// Get merchant info by merchant ID
// exports.getMerchantInfoByMerchantID = async (req, res) => {
//   try {
//     const { userID } = req.params; // userID is the merchantID

//     // Fetch merchant info
//     const merchant = await Merchantinfo.findOne({ userID }).populate("userID");

//     if (!merchant) {
//       return res.status(404).json({ message: "Merchant not found" });
//     }

//     // Fetch merchant product reviews
//     const reviews = await Merchantproductsreview.find({ merchantID: userID });

//     // Calculate total rating and count of reviews
//     const totalReviews = reviews.length;
//     const totalRating = totalReviews > 0
//       ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
//       : 0;

//     res.status(200).json({
//       merchant,
//       totalReviews,
//       totalRating: parseFloat(totalRating.toFixed(2)) // Keeping it to 2 decimal places
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getMerchantInfoByMerchantID = async (req, res) => {
  try {
    const { userID } = req.params; // userID is the merchantID

    // Fetch merchant info
    const merchant = await Merchantinfo.findOne({ userID }).populate("userID");

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });
    }

    // Fetch merchant product reviews
    const reviews = await Merchantproductsreview.find({ merchantID: userID });

    // Calculate total rating and count of reviews
    const totalReviews = reviews.length;
    const totalRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
      success: true,
      message: "Merchant data retrieved successfully",
      data: merchant, // Wrap merchant in a data property
      totalReviews,
      totalRating: parseFloat(totalRating.toFixed(2)), // Keeping it to 2 decimal places
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update merchant info by ID
 */
exports.updateMerchantInfo = [
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid merchant info ID format" });
      }

      const updateData = { ...req.body };
      if (req.file) updateData.profilePhoto = req.file.path;

      if (updateData.businessHours) {
        try {
          updateData.businessHours = JSON.parse(updateData.businessHours);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for businessHours",
          });
        }
      }
      if (updateData.highlightedStatement) {
        try {
          updateData.highlightedStatement = JSON.parse(
            updateData.highlightedStatement
          );
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for highlightedStatement",
          });
        }
      }

      const updatedInfo = await Merchantinfo.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedInfo) {
        return res
          .status(404)
          .json({ success: false, message: "Merchant info not found" });
      }
      res.status(200).json({
        success: true,
        message: "Merchant info updated successfully",
        data: updatedInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating merchant info",
        error: error.message,
      });
    }
  },
];

/**
 * Delete merchant info by ID
 */
exports.deleteMerchantInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInfo = await Merchantinfo.findByIdAndDelete(id);
    if (!deletedInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Merchant info not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Merchant info deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting merchant info",
      error: error.message,
    });
  }
};

// add the Account Id
exports.addAccountIdController = async (req, res) => {
  try {
    const { userID, stripeAccountId } = req.body;

    if (!userID || !stripeAccountId) {
      return res.status(400).json({
        status: false,
        message: "User ID and Stripe Account ID are required",
      });
    }

    // Find user to determine account type
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    let model;
    if (user.accountType === "merchant") {
      model = Merchantinfo;
    } else if (user.accountType === "professional") {
      model = Professionalinfo;
    } else if (user.accountType === "organization") {
      model = Organizationinfo;
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid account type",
      });
    }

    // Find the account info with both possible key names
    let accountInfo = await model.findOne({
      $or: [{ userID }, { userId: userID }],
    });

    accountInfo.stripeAccountId = stripeAccountId;
    await accountInfo.save();

    res.status(200).json({
      status: true,
      message: "Stripe Account ID added successfully",
      stripeAccountId: accountInfo.stripeAccountId,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error adding Stripe Account ID",
      error: error.message,
    });
  }
};

// remove account id
exports.removeAccountIdController = async (req, res) => {
  try {
    const { userID } = req.body;

    if (!userID) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    // Find user to determine account type
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    let model;
    if (user.accountType === "merchant") {
      model = Merchantinfo;
    } else if (user.accountType === "professional") {
      model = Professionalinfo;
    } else if (user.accountType === "organization") {
      model = Organizationinfo;
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid account type",
      });
    }

    // Find the account info with both possible key names
    let accountInfo = await model.findOne({
      $or: [{ userID }, { userId: userID }],
    });

    if (!accountInfo) {
      return res.status(404).json({
        status: false,
        message: "Account not found",
      });
    }

    accountInfo.stripeAccountId = null;
    await accountInfo.save();

    res.status(200).json({
      status: true,
      message: "Stripe account ID removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error removing Stripe account ID",
      error: error.message,
    });
  }
};

// check the vendor's Stripe Account ID availability
exports.checkAccountId = async (req, res) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    // Find user to determine account type
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    let model;
    if (user.accountType === "merchant") {
      model = Merchantinfo;
    } else if (user.accountType === "professional") {
      model = Professionalinfo;
    } else if (user.accountType === "organization") {
      model = Organizationinfo;
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid account type",
      });
    }

    // Find account info based on userID and check the availability of Stripe Account ID
    let accountInfo = await model.findOne({
      $or: [{ userID }, { userId: userID }],
    });
    if (!accountInfo || !accountInfo.stripeAccountId) {
      return res.status(404).json({
        status: false,
        message: "Stripe Account ID not available",
      });
    }

    res.status(200).json({
      status: true,
      message: "Stripe Account ID is available",
      stripeAccountId: accountInfo.stripeAccountId,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error checking Stripe Account ID",
      error: error.message,
    });
  }
};

// Top merchant based on total sell

exports.getTopMerchants = async (req, res) => {
  try {
    // Get pagination params (default: page 1, limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $unwind: { path: "$productId", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$sellerID",
          merchantID: { $first: "$sellerID" }, // Preserve merchant ID
          totalSales: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          merchantID: { $toObjectId: "$merchantID" }, // Convert to ObjectId for lookup
          totalSales: 1,
          totalOrders: 1,
        },
      },
      // Lookup merchant info from 'MerchantInfo' collection
      {
        $lookup: {
          from: "merchantinfos", // Correct collection name for merchant info
          localField: "merchantID",
          foreignField: "_id", // Match the ObjectId of merchantID with _id in 'merchantinfos'
          as: "merchantInfo",
        },
      },
      {
        $unwind: { path: "$merchantInfo", preserveNullAndEmptyArrays: true }, // This ensures we get data if there's a match
      },
      // Lookup products from 'merchantproducts' collection (but we won't include it in the final response)
      {
        $lookup: {
          from: "merchantproducts", // Collection name should be lowercase in MongoDB
          localField: "merchantID",
          foreignField: "merchantID",
          as: "products",
        },
      },
      {
        $project: {
          _id: 0, // Hide MongoDB default ID
          merchantID: 1,
          totalSales: 1,
          totalOrders: 1,
          businessName: "$merchantInfo.businessName",

          profilePhoto: "$merchantInfo.profilePhoto",
          about: "$merchantInfo.about",
          shortDescriptionOfStore: "$merchantInfo.shortDescriptionOfStore",
          address: "$merchantInfo.address",

          // Exclude the 'products' field from the response
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort by total sales in descending order
      },
      {
        $skip: skip, // Apply pagination
      },
      {
        $limit: limit, // Apply limit
      },
    ];

    // Get total count of merchants for pagination
    const totalMerchants = await Userpayment.aggregate([
      { $group: { _id: "$sellerID" } },
      { $count: "total" },
    ]);

    const totalPages =
      totalMerchants.length > 0
        ? Math.ceil(totalMerchants[0].total / limit)
        : 0;

    const topMerchants = await Userpayment.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: topMerchants,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalMerchants: totalMerchants.length > 0 ? totalMerchants[0].total : 0,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching top merchants:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// top merchant based on the reffed
exports.getTopMerchantsByReferral = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $group: {
          _id: "$creator",
          merchantID: { $first: "$creator" }, // Keep the creator ID (userID)
          totalParticipants: { $sum: { $size: "$participants" } }, // Count total participants
          totalPaid: { $sum: "$paid" }, // Sum of paid amount
          totalRemain: { $sum: "$remain" }, // Sum of remain amount
        },
      },
      {
        $project: {
          merchantID: { $toObjectId: "$merchantID" }, // Convert to ObjectId for lookup
          totalParticipants: 1,
          totalPaid: 1,
          totalRemain: 1,
          totalAmount: { $add: ["$totalPaid", "$totalRemain"] }, // Calculate total amount
        },
      },
      {
        $lookup: {
          from: "merchantinfos",
          localField: "merchantID", // Match with userID in Merchantinfo
          foreignField: "userID",
          as: "merchantInfo",
        },
      },
      {
        $match: { "merchantInfo.0": { $exists: true } }, // ✅ Ensure merchant exists in Merchantinfo
      },
      {
        $unwind: "$merchantInfo",
      },
      {
        $project: {
          _id: 0,
          merchantID: 1,
          totalParticipants: 1,
          totalPaid: 1,
          totalRemain: 1,
          totalAmount: 1,
          businessName: "$merchantInfo.businessName",
          profilePhoto: "$merchantInfo.profilePhoto",
          about: "$merchantInfo.about",
          shortDescriptionOfStore: "$merchantInfo.shortDescriptionOfStore",
          address: "$merchantInfo.address",
          fullName: "$merchantInfo.fullName",
        },
      },
      {
        $sort: { totalParticipants: -1 }, // Rank by total participants (descending)
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    // Get total count of merchants
    const totalMerchants = await Reffer.aggregate([
      {
        $lookup: {
          from: "merchantinfos",
          localField: "creator",
          foreignField: "userID",
          as: "merchantInfo",
        },
      },
      { $match: { "merchantInfo.0": { $exists: true } } }, // ✅ Only count merchants that exist in Merchantinfo
      { $group: { _id: "$creator" } },
      { $count: "total" },
    ]);

    const totalPages =
      totalMerchants.length > 0
        ? Math.ceil(totalMerchants[0].total / limit)
        : 0;

    const topMerchants = await Reffer.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: topMerchants,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalMerchants: totalMerchants.length > 0 ? totalMerchants[0].total : 0,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching top merchants by referral:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
