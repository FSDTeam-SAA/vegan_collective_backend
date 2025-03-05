const mongoose = require("mongoose");
const Reffer = require("../models/reffer.model");

// Function to find or create a referral
const findOrCreateReffer = async (req, res) => {
  const { creator } = req.body; // Creator ID from request body

  if (!mongoose.Types.ObjectId.isValid(creator)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
    });
  }

  try {
    // Dynamically import nanoid
    const { nanoid } = await import("nanoid");

    // Check if the creator already has a referral entry
    let reffer = await Reffer.findOne({ creator });

    if (reffer) {
      return res.status(200).json({
        success: true,
        message: "Referral entry already exists",
        data: reffer,
      });
    }

    // Generate a unique 7-character slug
    let slug;
    let isUnique = false;
    while (!isUnique) {
      slug = nanoid(7); // Generate a 7-character slug
      const slugExists = await Reffer.findOne({ slug });
      if (!slugExists) {
        isUnique = true;
      }
    }

    // Create a new referral entry
    reffer = new Reffer({
      slug,
      creator,
      paid: 0,
      remain: 0,
      participants: [],
    });

    await reffer.save();
    return res.status(201).json({
      success: true,
      message: "Referral entry created successfully",
      data: reffer,
    });
  } catch (error) {
    console.error("Error in findOrCreateReffer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  findOrCreateReffer,
};