const mongoose = require("mongoose");
const Reffer = require("../models/reffer.model");
const { nanoid } = require("nanoid");

// Function to find or create a referral
const findOrCreateReffer = async (req, res) => {
  const { creator } = req.body; // Creator ID from request body

  if (!mongoose.Types.ObjectId.isValid(creator)) {
    return res.status(400).json({ error: "Invalid creator ID" });
  }

  try {
    // Check if the creator already has a referral entry
    let reffer = await Reffer.findOne({ creator });

    if (reffer) {
      return res.status(200).json(reffer);
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
    return res.status(201).json(reffer);
  } catch (error) {
    console.error("Error in findOrCreateReffer:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  findOrCreateReffer,
};
