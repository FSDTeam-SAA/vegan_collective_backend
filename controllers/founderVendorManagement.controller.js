const Foundervendonmanagement = require('../models/founderVendorManagement.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have this model
const Merchantinfo = require('../models/merchantInfo.model'); // Assuming you have this model
const Organizationinfo = require('../models/organizationInfo.model'); // Assuming you have this model
const User = require('../models/user.model'); // Assuming you have this model
const nodemailer = require('nodemailer'); // For sending emails
const mongoose = require('mongoose');


exports.fetchRequiredData = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', order = 'asc', isVerified = 'all', role = 'all' } = req.query;

    // Ensure pagination is an integer
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate pagination values
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ success: false, message: "Invalid page number" });
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({ success: false, message: "Invalid limit number" });
    }

    const skip = (pageNumber - 1) * limitNumber;

    // Helper function to fetch email from UserModel
    const getEmail = async (userId) => {
      const user = await User.findById(userId, { email: 1 }).lean();
      return user ? user.email : null;
    };

    // Build the base query for filtering
    const buildQuery = (model, roleSpecificField) => {
      const query = {};

      // Apply search filter
      if (search) {
        query[roleSpecificField] = { $regex: search, $options: 'i' };
      }

      // Apply isVerified filter
      if (isVerified !== 'all') {
        query.isVerified = isVerified; // Directly use the value (pending, rejected, approved)
      }

      return query;
    };

    // Fetch professional info
    const professionalQuery = buildQuery(Professionalinfo, 'businessName');
    const professionalData = await Professionalinfo.find(professionalQuery, {
      businessName: 1, createdAt: 1, isVerified: 1, _id: 1, userId: 1,
      address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
    })
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .lean();

    const professionalsWithRole = await Promise.all(professionalData.map(async (item) => {
      const email = await getEmail(item.userId);
      return { ...item, email, role: 'professional', userID: item.userId };
    }));

    // Fetch merchant info
    const merchantQuery = buildQuery(Merchantinfo, 'businessName');
    const merchantData = await Merchantinfo.find(merchantQuery, {
      businessName: 1, createdAt: 1, isVerified: 1, _id: 1, userID: 1,
      address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
    })
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .lean();

    const merchantsWithRole = await Promise.all(merchantData.map(async (item) => {
      const email = await getEmail(item.userID);
      return { ...item, email, role: 'merchant' };
    }));

    // Fetch organization info
    const organizationQuery = buildQuery(Organizationinfo, 'organizationName');
    const organizationData = await Organizationinfo.find(organizationQuery, {
      organizationName: 1, createdAt: 1, isVerified: 1, _id: 1, userID: 1,
      address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
    })
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .lean();

    const organizationsWithRole = await Promise.all(organizationData.map(async (item) => {
      const email = await getEmail(item.userID);
      return { ...item, email, role: 'organization' };
    }));

    // Combine data based on role filter
    let combinedData = [];
    if (role === 'all') {
      combinedData = [...professionalsWithRole, ...merchantsWithRole, ...organizationsWithRole];
    } else if (role === 'professional') {
      combinedData = professionalsWithRole;
    } else if (role === 'merchant') {
      combinedData = merchantsWithRole;
    } else if (role === 'organization') {
      combinedData = organizationsWithRole;
    }

    // Apply global sorting
    combinedData.sort((a, b) => {
      if (order === 'asc') {
        return a.createdAt - b.createdAt;
      } else {
        return b.createdAt - a.createdAt;
      }
    });

    // Apply global pagination
    const paginatedData = combinedData.slice(skip, skip + limitNumber);

    // Total count for pagination
    const totalProfessionals = await Professionalinfo.countDocuments(professionalQuery);
    const totalMerchants = await Merchantinfo.countDocuments(merchantQuery);
    const totalOrganizations = await Organizationinfo.countDocuments(organizationQuery);
    const totalItems = role === 'all' ? totalProfessionals + totalMerchants + totalOrganizations :
      role === 'professional' ? totalProfessionals :
      role === 'merchant' ? totalMerchants :
      totalOrganizations;

    const totalPages = Math.ceil(totalItems / limitNumber);

    return res.status(200).json({
      success: true,
      message: "Fetched data",
      data: paginatedData,
      meta: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage: limitNumber,
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.fetchPendingVerificationData = async (req, res) => {
    try {
      // Fetch professional info where isVerified is "pending"
      const pendingProfessionals = await Professionalinfo.find(
        { isVerified: "pending" },
        { businessName: 1, createdAt: 1,address: 1, isVerified: 1, _id: 1, userId: 1 }
      ).lean();
  
      // Fetch merchant info where isVerified is "pending"
      const pendingMerchants = await Merchantinfo.find(
        { isVerified: "pending" },
        { businessName: 1, createdAt: 1,address: 1,isVerified: 1, _id: 1, userID: 1 }
      ).lean();
  
      // Fetch organization info where isVerified is "pending"
      const pendingOrganizations = await Organizationinfo.find(
        { isVerified: "pending" },
        { organizationName: 1, createdAt: 1, address: 1,isVerified: 1, _id: 1, userID: 1 }
      ).lean();
  
      // Return the combined data with roles included
      return res.status(200).json({
        success: true,
        pendingProfessionalInfo: pendingProfessionals,
        pendingMerchantInfo: pendingMerchants,
        pendingOrganizationInfo: pendingOrganizations,
      });
    } catch (error) {
      console.error("Error fetching pending verification data:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };


  exports.fetchPendingVerificationDataById = async (req, res) => {
    try {
      // Extract _id from request parameters
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required.",
        });
      }
  
      // Helper function to fetch email by userId
      const getEmail = async (userId) => {
        if (!userId) return null;
  
        // Validate the userId and convert it to ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error("Invalid userId:", userId);
          return null;
        }
  
        const user = await User.findById(new mongoose.Types.ObjectId(userId), { email: 1 }).lean();
        return user?.email || null;
      };
  
      // Fetch pending professional info
      const pendingProfessional = await Professionalinfo.findOne(
        { isVerified: { $in: ["approved", "declined", "pending"] }, _id: id },
        {
          userId: 1, // Ensure this matches the field name in your database
          fullName: 1,
          businessName: 1,
          address: 1,
          isVerified: 1,
          createdAt: 1,
          governmentIssuedID: 1,
          photoWithID: 1,
          professionalCertification: 1,
        }
      ).lean();
  
      if (pendingProfessional) {
        // Enrich the professional data with email and role
        const professionalsWithRole = await Promise.all(
          [pendingProfessional].map(async (item) => {
            const email = await getEmail(item.userId); // Fetch email using the helper function
            return {
              ...item,
              email,
              role: "professional",
              userID: item.userId, // Add userID for consistency
            };
          })
        );
  
        return res.status(200).json({
          success: true,
          message: "Pending verification data retrieved successfully.",
          data: professionalsWithRole[0], // Return the enriched data
        });
      }
  
      // Fetch pending merchant info
      const pendingMerchant = await Merchantinfo.findOne(
        { isVerified: { $in: ["approved", "declined", "pending"] }, _id: id },
        {
          userID: 1,
          fullName: 1,
          businessName: 1,
          address: 1,
          isVerified: 1,
          createdAt: 1,
          governmentIssuedID: 1,
          photoWithID: 1,
          professionalCertification: 1,
        }
      ).lean();
  
      if (pendingMerchant) {
        const email = await getEmail(pendingMerchant.userID); // Fetch email using the helper function
        return res.status(200).json({
          success: true,
          message: "Pending verification data retrieved successfully.",
          data: {
            ...pendingMerchant,
            email,
            role: "merchant",
          },
        });
      }
  
      // Fetch pending organization info
      const pendingOrganization = await Organizationinfo.findOne(
        { isVerified: "pending", _id: id },
        {
          userID: 1,
          organizationName: 1,
          address: 1,
          isVerified: 1,
          createdAt: 1,
          governmentIssuedID: 1,
          photoWithID: 1,
          professionalCertification: 1,
        }
      ).lean();
  
      if (pendingOrganization) {
        const email = await getEmail(pendingOrganization.userID); // Fetch email using the helper function
        return res.status(200).json({
          success: true,
          message: "Pending verification data retrieved successfully.",
          data: {
            ...pendingOrganization,
            email,
            role: "organization",
          },
        });
      }
  
      // If no data is found in any collection
      return res.status(404).json({
        success: false,
        message: "No pending verification data found for the given ID.",
      });
    } catch (error) {
      console.error("Error fetching pending verification data by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  };
  
  exports.updateVerificationStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Validate required fields
        if (!userId || !status) {
            return res.status(400).json({ success: false, message: "Missing required fields: userId or status" });
        }

        // Validate allowed statuses
        const allowedStatuses = ["approved", "declined", "pending"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Allowed values are: approved, declined, pending" });
        }

        // Validate userId format
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId format" });
        }

        // Update Merchantinfo
        const merchantInfoUpdated = await Merchantinfo.findOneAndUpdate(
            { userID: userId },
            { isVerified: status },
            { new: true }
        );

        // Update Professionalinfo
        const professionalInfoUpdated = await Professionalinfo.findOneAndUpdate(
            { userID: userId },
            { isVerified: status },
            { new: true }
        );

        // Update Organizationinfo
        const organizationInfoUpdated = await Organizationinfo.findOneAndUpdate(
            { userID: userId },
            { isVerified: status },
            { new: true }
        );

        // Log updates for debugging
        // console.log("Merchant Info Updated:", merchantInfoUpdated);
        // console.log("Professional Info Updated:", professionalInfoUpdated);
        // console.log("Organization Info Updated:", organizationInfoUpdated);

        // Send email notification (optional)
        // You can use the `sendVerificationStatusEmail` function here if needed.

        // Respond with success
        return res.status(200).json({
            success: true,
            message: `Verification status updated to ${status} for all info types`,
        });
    } catch (error) {
        console.error("Error updating verification status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

async function sendVerificationStatusEmail(email, status) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Status Update',
            html: `<p>Your verification status has been updated to: <strong>${status}</strong>.</p>`
        });
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}
  

exports.getFounderVendorDetails = async (req, res) => {
  try {
      const { id, userID } = req.query; // Get both ID and userID from query parameters

      if (!id) {
          return res.status(400).json({
              success: false,
              message: 'ID is required',
          });
      }

      if (!userID) {
          return res.status(400).json({
              success: false,
              message: 'userID is required',
          });
      }

      // Fetch data from database
      const professionalData = await Professionalinfo.findById(id).catch(() => null);
      const merchantData = await Merchantinfo.findById(id).catch(() => null);
      const organizationData = await Organizationinfo.findById(id).catch(() => null);
      const userData = await User.findById(userID).catch(() => null);

      // Combine data into a structured response
      const profileData = {
          profilePhoto: professionalData?.profilePhoto || merchantData?.profilePhoto || organizationData?.profilePhoto || null,
          shortDescriptionOfStore: professionalData?.designation || merchantData?.shortDescriptionOfStore || organizationData?.shortDescriptionOfOrganization || null,
          businessName: professionalData?.businessName || merchantData?.businessName || null,
          organizationName: organizationData?.organizationName || null,
          about: professionalData?.about || merchantData?.about || organizationData?.about || null,
          experience: professionalData?.experience || organizationData?.experience || null,
          certifications: professionalData?.certifications || organizationData?.certifications || null,
          submittedDocuments: {
              governmentIssuedID: professionalData?.governmentIssuedID || merchantData?.governmentIssuedID || organizationData?.governmentIssuedID || null,
              photoWithID: professionalData?.photoWithID || merchantData?.photoWithID || organizationData?.photoWithID || null,
              professionalCertification: professionalData?.professionalCertification || merchantData?.professionalCertification || organizationData?.professionalCertification || null,
          },
          contactInfo: {
              email: userData?.email || null, // Use email from the user data fetched using userID
              phoneNumber: professionalData?.phoneNumber || merchantData?.phoneNumber || organizationData?.phoneNumber || null,
          },
      };

      // Send the combined data as a response
      res.status(200).json({
          success: true,
          message: 'Profile data retrieved successfully',
          data: profileData,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Internal Server Error',
      });
  }
};



