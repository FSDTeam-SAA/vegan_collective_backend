const mongoose = require("mongoose");
const Merchantinfo = require("../models/merchantInfo.model");
const User = require("../models/user.model");
const upload = require("../utils/multerConfig");
const Professionalinfo = require('../models/professionalInfo.model')
const Organizationinfo = require('../models/organizationInfo.model')

/**
 * Create a new merchant info entry with profile photo upload
 */
exports.createMerchantInfo = async (req, res) => {
  try {
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      let { userID, fullName, businessName, address, about, shortDescriptionOfStore, businessHours, highlightedStatement, websiteURL, governmentIssuedID, professionalCertification, photoWithID, isVerified } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ success: false, message: "Invalid userID format" });
      }

      const userExists = await User.findById(userID);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "User does not exist" });
      }

      const existingMerchantInfo = await Merchantinfo.findOne({ userID });
      if (existingMerchantInfo) {
        return res.status(400).json({ success: false, message: "Merchant info already exists for this user" });
      }

      let parsedBusinessHours = [];
      let parsedHighlightedStatement = [];
      
      
      try {
        if (businessHours) parsedBusinessHours = JSON.parse(businessHours);
        if (highlightedStatement) parsedHighlightedStatement = JSON.parse(highlightedStatement);
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for businessHours or highlightedStatement" });
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
      res.status(201).json({ success: true, message: "Merchant info created successfully", data: savedMerchantInfo });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating merchant info", error: error.message });
  }
};

/**
 * Get all merchant info entries with filtering, pagination, and sorting
 */
exports.getAllMerchantInfo = async (req, res) => {
  try {
    const { page = 1, limit = 6, sortBy = "fullName", order = "asc", fullName, businessName, address } = req.query;

    const filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (businessName) filter.businessName = { $regex: businessName, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const merchantInfoList = await Merchantinfo.find(filter).sort(sortOptions).skip(skip).limit(parseInt(limit));
    const totalDocuments = await Merchantinfo.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    return res.status(200).json({ success: true, message: "Merchant info retrieved successfully", data: merchantInfoList, pagination: { currentPage: parseInt(page), totalPages, totalItems: totalDocuments, itemsPerPage: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving merchant info", error: error.message });
  }
};

/**
 * Get a single merchant info entry by ID
 */
/**
 * Get a single merchant info entry by merchantID
 */
exports.getMerchantInfoByMerchantID = async (req, res) => {
  try {
    const { merchantID } = req.params; // Extract merchantID from request parameters

    // Query the database using findOne and filter by merchantID
    const merchantInfo = await Merchantinfo.findOne({ merchantID });

    // If no merchant info is found, return a 404 error
    if (!merchantInfo) {
      return res.status(404).json({ success: false, message: "Merchant info not found" });
    }

    // Return the retrieved merchant info with a success response
    res.status(200).json({
      success: true,
      message: "Merchant info retrieved successfully",
      data: merchantInfo,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      success: false,
      message: "Error retrieving merchant info",
      error: error.message,
    });
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
        return res.status(400).json({ success: false, message: "Invalid merchant info ID format" });
      }

      const updateData = { ...req.body };
      if (req.file) updateData.profilePhoto = req.file.path;

      if (updateData.businessHours) {
        try {
          updateData.businessHours = JSON.parse(updateData.businessHours);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for businessHours" });
        }
      }
      if (updateData.highlightedStatement) {
        try {
          updateData.highlightedStatement = JSON.parse(updateData.highlightedStatement);
        } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid JSON format for highlightedStatement" });
        }
      }

      const updatedInfo = await Merchantinfo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedInfo) {
        return res.status(404).json({ success: false, message: "Merchant info not found" });
      }
      res.status(200).json({ success: true, message: "Merchant info updated successfully", data: updatedInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating merchant info", error: error.message });
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
      return res.status(404).json({ success: false, message: "Merchant info not found" });
    }
    res.status(200).json({ success: true, message: "Merchant info deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting merchant info", error: error.message });
  }
};

// add the Account Id
exports.addAccountIdController = async (req, res) => {
  try {
    const { userID, stripeAccountId } = req.body

    if (!userID || !stripeAccountId) {
      return res.status(400).json({
        status: false,
        message: 'User ID and Stripe Account ID are required',
      })
    }

    // Find user to determine account type
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    let model
    if (user.accountType === 'merchant') {
      model = Merchantinfo
    } else if (user.accountType === 'professional') {
      model = Professionalinfo
    } else if (user.accountType === 'organization') {
      model = Organizationinfo
    } else {
      return res.status(400).json({
        status: false,
        message: 'Invalid account type',
      })
    }

    // Find and update the correct model
    let accountInfo = await model.findOne({  userID })
    if (!accountInfo) {
      return res
        .status(404)
        .json({ status: false, message: 'Account not found' })
    }

    accountInfo.stripeAccountId = stripeAccountId
    await accountInfo.save()

    res.status(200).json({
      status: true,
      message: 'Stripe Account ID added successfully',
      stripeAccountId: accountInfo.stripeAccountId,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error adding Stripe Account ID',
      error: error.message,
    })
  }
}

// remove account id 
exports.removeAccountIdController = async (req, res) => {
  try {
    const { userID } = req.body

    if (!userID) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      })
    }

    // Find user to determine account type
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      })
    }

    let model
    if (user.accountType === 'merchant') {
      model = Merchantinfo
    } else if (user.accountType === 'professional') {
      model = Professionalinfo
    } else if (user.accountType === 'organization') {
      model = Organizationinfo
    } else {
      return res.status(400).json({
        status: false,
        message: 'Invalid account type',
      })
    }

    // Find the account info based on userID and remove the Stripe Account ID
    let accountInfo = await model.findOne({ userID })
    if (!accountInfo) {
      return res.status(404).json({
        status: false,
        message: 'Account not found',
      })
    }

    accountInfo.stripeAccountId = null
    await accountInfo.save()

    res.status(200).json({
      status: true,
      message: 'Stripe account ID removed successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error removing Stripe account ID',
      error: error.message,
    })
  }
}

// check the vendor's Stripe Account ID availability
exports.checkAccountId = async (req, res) => {
  try {
    const { userID } = req.params 

    if (!userID) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      })
    }

    // Find user to determine account type
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      })
    }

    let model
    if (user.accountType === 'merchant') {
      model = Merchantinfo
    } else if (user.accountType === 'professional') {
      model = Professionalinfo
    } else if (user.accountType === 'organization') {
      model = Organizationinfo
    } else {
      return res.status(400).json({
        status: false,
        message: 'Invalid account type',
      })
    }

    // Find account info based on userID and check the availability of Stripe Account ID
    let accountInfo = await model.findOne({ userID })
    if (!accountInfo || !accountInfo.stripeAccountId) {
      return res.status(404).json({
        status: false,
        message: 'Stripe Account ID not available',
      })
    }

    res.status(200).json({
      status: true,
      message: 'Stripe Account ID is available',
      stripeAccountId: accountInfo.stripeAccountId,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error checking Stripe Account ID',
      error: error.message,
    })
  }
}
