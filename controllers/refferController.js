const mongoose = require("mongoose");
const Reffer = require("../models/reffer.model");

const Professionalinfo = require('../models/professionalInfo.model');
const Merchantinfo  = require("../models/merchantInfo.model");
const Organizationinfo= require("../models/organizationInfo.model");

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


// New function to get referral by creator ID
const getRefferByCreator = async (req, res) => {
  const { creatorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
      data: [],
    });
  }

  try {
    const reffer = await Reffer.findOne({ creator: creatorId });

    if (!reffer) {
      return res.status(200).json({
        success: true,
        message: "No referral entry found for this creator",
        data: [],
      });
    }

    // Calculate total referrals from participants array length
    const totalReferrals = reffer.participants.length;

    return res.status(200).json({
      success: true,
      message: "Referral entry retrieved successfully",
      data: {
        ...reffer.toObject(), // Convert Mongoose document to plain object
        totalReferrals // Add total referrals to the response
      },
    });
  } catch (error) {
    console.error("Error in getRefferByCreator:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: [],
    });
  }
};

// Function to get top professionals based on totalReferrals
// const getTopProfessionals = async (req, res) => {
//   try {
//     // Fetch all referral entries with non-empty participants arrays
//     const referrals = await Reffer.find({ participants: { $exists: true, $not: { $size: 0 } } })
//       .limit(100); // Fetch up to 100 documents for in-memory sorting

    

//     // Transform the data to include totalReferrals and remain
//     const topProfessionals = referrals
//       .map((referral) => ({
//         creator: referral.creator,
//         // slug: referral.slug,
//         totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
//         remain: referral.remain || 0,
//       }))
//       .sort((a, b) => b.totalReferrals - a.totalReferrals) // Sort by totalReferrals in descending order
//       .slice(0, 10); // Limit to top 10 professionals

//     return res.status(200).json({
//       success: true,
//       message: "Top professionals fetched successfully.",
//       data: topProfessionals,
//     });
//   } catch (error) {
//     console.error("Error in getTopProfessionals:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
const getTopProfessionals = async (req, res) => {
  try {
    // Fetch all referral entries with non-empty participants arrays
    const referrals = await Reffer.find({ participants: { $exists: true, $not: { $size: 0 } } })
      .limit(100); // Fetch up to 100 documents for in-memory sorting

    // Transform the data to include totalReferrals and remain
    const topProfessionals = await Promise.all(referrals.map(async (referral) => {
      const creatorId = referral.creator;

      // Check if the creator exists in Professionalinfo
      const professionalInfo = await Professionalinfo.findOne({ userId: creatorId });
      if (professionalInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          remain: referral.remain || 0,
          type: 'Professional',
          fullName: professionalInfo.fullName,
          designation: professionalInfo.designation,
        };
      }

      // Check if the creator exists in Merchantinfo
      const merchantInfo = await Merchantinfo.findOne({ userID: creatorId });
      if (merchantInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          remain: referral.remain || 0,
          type: 'Merchant',
          fullName: merchantInfo.fullName,
          shortDescriptionOfStore: merchantInfo.shortDescriptionOfStore,
        };
      }

      // Check if the creator exists in Organizationinfo
      const organizationInfo = await Organizationinfo.findOne({ userID: creatorId });
      if (organizationInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          remain: referral.remain || 0,
          type: 'Organization',
          organizationName: organizationInfo.organizationName,
          shortDescriptionOfOrganization: organizationInfo.shortDescriptionOfOrganization,
        };
      }

      // If no matching record is found, return basic data
      return {
        creator: creatorId,
        totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
        remain: referral.remain || 0,
        type: 'Unknown',
      };
    }));

    // Sort by totalReferrals in descending order and limit to top 10 professionals
    const sortedTopProfessionals = topProfessionals
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      message: "Top professionals fetched successfully.",
      data: sortedTopProfessionals,
    });
  } catch (error) {
    console.error("Error in getTopProfessionals:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  findOrCreateReffer,
  getRefferByCreator,
  getTopProfessionals,
};

