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

    // Transform the data to include totalReferrals, remain, and amount
    const topProfessionals = await Promise.all(referrals.map(async (referral) => {
      const creatorId = referral.creator;

      // Check if the creator exists in Professionalinfo
      const professionalInfo = await Professionalinfo.findOne({ userId: creatorId });
      if (professionalInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          // remain: referral.remain || 0,
          // paid: referral.paid || 0, // Ensure paid field is included
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
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
          // remain: referral.remain || 0,
          // paid: referral.paid || 0, // Ensure paid field is included
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
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
          // remain: referral.remain || 0,
          // paid: referral.paid || 0, // Ensure paid field is included
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
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
        paid: referral.paid || 0, // Ensure paid field is included
        amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
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


const getTopReferrersByArea = async (req, res) => {
  const { areaType, areaValue } = req.query; // areaType: 'local', 'regional', 'national'

  try {
    // Validate areaType
    if (!['local', 'regional', 'national'].includes(areaType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid area type. Must be 'local', 'regional', or 'national'.",
      });
    }

    // Validate areaValue
    if (!areaValue || typeof areaValue !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid area value. Must be a non-empty string.",
      });
    }

    // Fetch all referral entries with non-empty participants arrays
    const referrals = await Reffer.find({ participants: { $exists: true, $not: { $size: 0 } } })
      .limit(100); // Fetch up to 100 documents for in-memory sorting

    // Transform the data to include totalReferrals, remain, and amount
    const topReferrers = await Promise.all(referrals.map(async (referral) => {
      const creatorId = referral.creator;

      // Check if the creator exists in Professionalinfo
      const professionalInfo = await Professionalinfo.findOne({ userId: creatorId });
      if (professionalInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
          type: 'Professional',
          fullName: professionalInfo.fullName,
          designation: professionalInfo.designation,
          address: professionalInfo.address, // Include address for filtering
        };
      }

      // Check if the creator exists in Merchantinfo
      const merchantInfo = await Merchantinfo.findOne({ userID: creatorId });
      if (merchantInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
          type: 'Merchant',
          fullName: merchantInfo.fullName,
          shortDescriptionOfStore: merchantInfo.shortDescriptionOfStore,
          address: merchantInfo.address, // Include address for filtering
        };
      }

      // Check if the creator exists in Organizationinfo
      const organizationInfo = await Organizationinfo.findOne({ userID: creatorId });
      if (organizationInfo) {
        return {
          creator: creatorId,
          totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
          amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
          type: 'Organization',
          organizationName: organizationInfo.organizationName,
          shortDescriptionOfOrganization: organizationInfo.shortDescriptionOfOrganization,
          address: organizationInfo.address, // Include address for filtering
        };
      }

      // If no matching record is found, return basic data
      return {
        creator: creatorId,
        totalReferrals: Array.isArray(referral.participants) ? referral.participants.length : 0,
        amount: (referral.paid || 0) + (referral.remain || 0), // Calculate amount
        type: 'Unknown',
        address: null,
      };
    }));

    // Filter top referrers based on areaType and areaValue
    const filteredTopReferrers = topReferrers.filter((referrer) => {
      if (!referrer.address) return false;

      const addressParts = referrer.address.split(',').map(part => part.trim());
      switch (areaType) {
        case 'local':
          return addressParts[0].toLowerCase() === areaValue.toLowerCase(); // City/Municipality
        case 'regional':
          return addressParts[1].toLowerCase() === areaValue.toLowerCase(); // State/Province
        case 'national':
          return addressParts[2].toLowerCase() === areaValue.toLowerCase(); // Country
        default:
          return false;
      }
    });

    // Sort by totalReferrals in descending order and limit to top 10 referrers
    const sortedTopReferrers = filteredTopReferrers
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      message: `Top referrers in ${areaType} area fetched successfully.`,
      data: sortedTopReferrers,
    });
  } catch (error) {
    console.error("Error in getTopReferrersByArea:", error);
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
  getTopReferrersByArea
  
};

