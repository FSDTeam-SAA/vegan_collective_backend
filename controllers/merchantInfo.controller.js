const Merchantinfo = require("../models/merchantInfo.model");
const User = require("../models/user.model"); // Assuming you have a User model

// Create a new merchant info
exports.createMerchantInfo = async (req, res) => {
  try {
    const {
      userID,
      businessName,
      address,
      about,
      shortDescriptionOfStore,
      businessHours,
      highlightedStatement,
      websiteURL,
    } = req.body;

    // Check if the user exists in the database
    const userExists = await User.findById(userID);
    if (!userExists) {
      return res.status(400).json({ error: "Invalid userID. User does not exist." });
    }

    const newMerchantInfo = new Merchantinfo({
      userID,
      businessName,
      address,
      about,
      shortDescriptionOfStore,
      businessHours,
      highlightedStatement,
      websiteURL,
    });

    const savedMerchantInfo = await newMerchantInfo.save();
    res.status(201).json(savedMerchantInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all merchant info with optional filters
// Get all merchant info with optional filters, pagination, and sorting
exports.getAllMerchantInfo = async (req, res) => {
  try {
    const { search, title, description, page = 1, limit = 10, sortBy = "businessName" } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
      ];
    }
    if (title || description) {
      query.highlightedStatement = {};
      if (title) {
        query.highlightedStatement.title = { $regex: title, $options: "i" };
      }
      if (description) {
        query.highlightedStatement.description = {
          $regex: description,
          $options: "i",
        };
      }
    }

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch merchants with pagination and sorting
    const merchants = await Merchantinfo.find(query)
      .populate("userID")
      .sort({ [sortBy]: 1 }) // Sort in ascending order
      .skip(skip)
      .limit(limitNumber);

    // Count total documents for pagination metadata
    const totalMerchants = await Merchantinfo.countDocuments(query);

    res.status(200).json({
      data: merchants,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMerchants / limitNumber),
        totalItems: totalMerchants,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single merchant info by ID
exports.getMerchantInfoById = async (req, res) => {
  try {
    const merchantInfo = await Merchantinfo.findById(req.params.id).populate(
      "userID"
    );
    if (!merchantInfo) {
      return res.status(404).json({ message: "Merchant info not found" });
    }
    res.status(200).json(merchantInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a merchant info by ID
exports.updateMerchantInfo = async (req, res) => {
  try {
    const {
      userID,
      businessName,
      address,
      about,
      shortDescriptionOfStore,
      businessHours,
      highlightedStatement,
      websiteURL,
    } = req.body;

    // Check if the user exists in the database
    const userExists = await User.findById(userID);
    if (!userExists) {
      return res.status(400).json({ error: "Invalid userID. User does not exist." });
    }

    const updatedMerchantInfo = await Merchantinfo.findByIdAndUpdate(
      req.params.id,
      {
        userID,
        businessName,
        address,
        about,
        shortDescriptionOfStore,
        businessHours,
        highlightedStatement,
        websiteURL,
      },
      { new: true }
    );

    if (!updatedMerchantInfo) {
      return res.status(404).json({ message: "Merchant info not found" });
    }

    res.status(200).json(updatedMerchantInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a merchant info by ID
exports.deleteMerchantInfo = async (req, res) => {
  try {
    const deletedMerchantInfo = await Merchantinfo.findByIdAndDelete(
      req.params.id
    );
    if (!deletedMerchantInfo) {
      return res.status(404).json({ message: "Merchant info not found" });
    }
    res.status(200).json({ message: "Merchant info deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};