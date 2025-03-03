const Foundervendonmanagement = require('../models/founderVendorManagement.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have this model
const Merchantinfo = require('../models/merchantInfo.model'); // Assuming you have this model
const Organizationinfo = require('../models/organizationInfo.model'); // Assuming you have this model
const User = require('../models/user.model'); // Assuming you have this model
const nodemailer = require('nodemailer'); // For sending emails


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



// exports.fetchRequiredData = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = '', order = 'asc', isVerified = 'all', role = 'all' } = req.query;
//     const pageNumber = parseInt(page, 10);
//     const limitNumber = parseInt(limit, 10);
//     const skip = (pageNumber - 1) * limitNumber;

//     // Helper function to fetch email from UserModel
//     const getEmail = async (userId) => {
//       const user = await User.findById(userId, { email: 1 }).lean();
//       return user ? user.email : null;
//     };

//     // Build the base query for filtering
//     const buildQuery = (model, roleSpecificField) => {
//       const query = {};

//       // Apply search filter
//       if (search) {
//         query[roleSpecificField] = { $regex: search, $options: 'i' };
//       }

//       // Apply isVerified filter
//       if (isVerified !== 'all') {
//         query.isVerified = isVerified; // Directly use the value (pending, rejected, approved)
//       }

//       return query;
//     };

//     // Fetch professional info
//     const professionalQuery = buildQuery(Professionalinfo, 'businessName');
//     const professionalData = await Professionalinfo.find(professionalQuery, {
//       businessName: 1, createdAt: 1, isVerified: 1, _id: 1, userId: 1,
//       address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
//     })
//       .sort({ createdAt: order === 'asc' ? 1 : -1 })
//       .skip(skip)
//       .limit(limitNumber)
//       .lean();

//     const professionalsWithRole = await Promise.all(professionalData.map(async (item) => {
//       const email = await getEmail(item.userId);

//       const resData = { ...item, email, role: 'professional', userID: item.userId };

//       delete resData.userId;
//       return resData
//     }));

//     // Fetch merchant info
//     const merchantQuery = buildQuery(Merchantinfo, 'businessName');
//     const merchantData = await Merchantinfo.find(merchantQuery, {
//       businessName: 1, createdAt: 1, isVerified: 1, _id: 1, userID: 1,
//       address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
//     })
//       .sort({ createdAt: order === 'asc' ? 1 : -1 })
//       .skip(skip)
//       .limit(limitNumber)
//       .lean();

//     const merchantsWithRole = await Promise.all(merchantData.map(async (item) => {
//       const email = await getEmail(item.userID);
//       return { ...item, email, role: 'merchant' };
//     }));

//     // Fetch organization info
//     const organizationQuery = buildQuery(Organizationinfo, 'organizationName');
//     const organizationData = await Organizationinfo.find(organizationQuery, {
//       organizationName: 1, createdAt: 1, isVerified: 1, _id: 1, userID: 1,
//       address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
//     })
//       .sort({ createdAt: order === 'asc' ? 1 : -1 })
//       .skip(skip)
//       .limit(limitNumber)
//       .lean();

//     const organizationsWithRole = await Promise.all(organizationData.map(async (item) => {
//       const email = await getEmail(item.userID);
//       return { ...item, email, role: 'organization' };
//     }));

//     // Combine data based on role filter
//     let combinedData = [];
//     if (role === 'all') {
//       combinedData = [...professionalsWithRole, ...merchantsWithRole, ...organizationsWithRole];
//     } else if (role === 'professional') {
//       combinedData = professionalsWithRole;
//     } else if (role === 'merchant') {
//       combinedData = merchantsWithRole;
//     } else if (role === 'organization') {
//       combinedData = organizationsWithRole;
//     }

//     // Total count for pagination
//     const totalProfessionals = await Professionalinfo.countDocuments(professionalQuery);
//     const totalMerchants = await Merchantinfo.countDocuments(merchantQuery);
//     const totalOrganizations = await Organizationinfo.countDocuments(organizationQuery);
//     const totalItems = role === 'all' ? totalProfessionals + totalMerchants + totalOrganizations :
//       role === 'professional' ? totalProfessionals :
//       role === 'merchant' ? totalMerchants :
//       totalOrganizations;

//     const totalPages = Math.ceil(totalItems / limitNumber);

//     return res.status(200).json({
//       success: true,
//       message: "Fetched data",
//       data: combinedData,
//       meta: {
//         currentPage: pageNumber,
//         totalPages,
//         totalItems,
//         itemsPerPage: limitNumber,
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

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

exports.updateVerificationStatus = async (req, res) => {
  try {
    const { id, role, status } = req.body;

    if (!id || !role || !status) {
      return res.status(400).json({ success: false, message: "Missing required fields: id, role, or status" });
    }

    let model;
    let userIdField;

    switch (role) {
      case 'professional':
        model = Professionalinfo;
        userIdField = 'userId';
        break;
      case 'merchant':
        model = Merchantinfo;
        userIdField = 'userID';
        break;
      case 'organization':
        model = Organizationinfo;
        userIdField = 'userID';
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const record = await model.findById(id).lean();
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    await model.findByIdAndUpdate(id, { isVerified: status });

    return res.status(200).json({ success: true, message: `Verification status updated to ${status} successfully` });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

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
      // Fetch professional info
      // Combine data into a structured response
      const profileData = {
          profilePhoto: professionalData?.profilePhoto ||  merchantData?.profilePhoto || organizationData?.profilePhoto || null,
          businessName: professionalData?.businessName || merchantData?.businessName || null,
          organizationName: organizationData?.organizationName || null,
          about: professionalData?.about || merchantData?.about || organizationData?.about || null,
          experience: professionalData?.experience || organizationData?.experience || null,
          certifications: professionalData?.certifications || organizationData?.certifications || null,
          submittedDocuments: {
              governmentIssuedID: professionalData?.governmentIssuedID || merchantData?.governmentIssuedID || organizationData?.governmentIssuedID || null,
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

