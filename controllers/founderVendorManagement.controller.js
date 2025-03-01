const Foundervendonmanagement = require('../models/founderVendorManagement.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have this model
const Merchantinfo = require('../models/merchantInfo.model'); // Assuming you have this model
const Organizationinfo = require('../models/organizationInfo.model'); // Assuming you have this model
const User = require('../models/user.model'); // Assuming you have this model
const nodemailer = require('nodemailer'); // For sending emails

exports.fetchRequiredData = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', order = 'asc', isVerified = 'all', role = 'all' } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
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
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const professionalsWithRole = await Promise.all(professionalData.map(async (item) => {
      const email = await getEmail(item.userId);
      return { ...item, email, role: 'professional' };
    }));

    // Fetch merchant info
    const merchantQuery = buildQuery(Merchantinfo, 'businessName');
    const merchantData = await Merchantinfo.find(merchantQuery, {
      businessName: 1, createdAt: 1, isVerified: 1, _id: 1, userID: 1,
      address: 1, governmentIssuedID: 1, photoWithID: 1, professionalCertification: 1
    })
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNumber)
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
      .skip(skip)
      .limit(limitNumber)
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
      data: combinedData,
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
//     try {
//       // Helper function to fetch email from UserModel
//       const getEmail = async (userId) => {
//         const user = await User.findById(userId, { email: 1 }).lean();
//         return user ? user.email : null;
//       };
  
//       // Fetch professional info and add role: 'professional'
//       const professionalData = await Professionalinfo.find(
//         {},
//         { 
//           businessName: 1, 
//           createdAt: 1, 
//           isVerified: 1, 
//           _id: 1, 
//           userId: 1,
//           address: 1,
//           governmentIssuedID: 1, 
//           photoWithID: 1, 
//           professionalCertification: 1 
//         }
//       ).lean();
  
//       const professionalsWithRole = await Promise.all(professionalData.map(async (item) => {
//         const email = await getEmail(item.userId);
//         return {
//           ...item,
//           email,
//           role: 'professional',
//         };
//       }));
  
//       // Fetch merchant info and add role: 'merchant'
//       const merchantData = await Merchantinfo.find(
//         {},
//         { 
//           businessName: 1, 
//           createdAt: 1, 
//           isVerified: 1, 
//           _id: 1, 
//           userID: 1,
//           address: 1,
//           governmentIssuedID: 1, 
//           photoWithID: 1, 
//           professionalCertification: 1 
//         }
//       ).lean();
  
//       const merchantsWithRole = await Promise.all(merchantData.map(async (item) => {
//         const email = await getEmail(item.userID);
//         return {
//           ...item,
//           email,
//           role: 'merchant',
//         };
//       }));
  
//       // Fetch organization info and add role: 'organization'
//       const organizationData = await Organizationinfo.find(
//         {},
//         { 
//           // organizationName: 1, 
//           businessName: "$organizationName",
//           createdAt: 1, 
//           isVerified: 1, 
//           _id: 1, 
//           userID: 1,
//           address: 1,
//           governmentIssuedID: 1, 
//           photoWithID: 1, 
//           professionalCertification: 1 
//         }
//       ).lean();
  
//       const organizationsWithRole = await Promise.all(organizationData.map(async (item) => {
//         const email = await getEmail(item.userID);
//         return {
//           ...item,
//           email,
//           role: 'organization',
//         };
//       }));

//       return res.status(200).json({
//         success : true,
//         message : "fetched data",
//         data : [
//           ...professionalsWithRole,
//           ...merchantsWithRole,
//           ...organizationsWithRole,
//         ]
//       });
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
//   };

// exports.fetchRequiredData = async (req, res) => {
//   try {
//       const { search, order = 'asc', isVerified, role, page = 1, limit = 10 } = req.query;

//       const pageNumber = parseInt(page, 10);
//       const limitNumber = parseInt(limit, 10);
//       const sortOrder = order === 'asc' ? 1 : -1;

//       console.log("Received Query Params:", req.query);

//       // Helper function to fetch email from UserModel
//       const getEmail = async (userId) => {
//           if (!userId) return null;
//           const user = await User.findById(userId, { email: 1 }).lean();
//           return user ? user.email : null;
//       };

//       let data = [];

//       // **Common Filter Logic**
//       const createFilter = (searchField) => {
//           let filter = {};

//           if (search) {
//               filter[searchField] = { $regex: search, $options: "i" };
//           }

//           if (isVerified && isVerified !== "all") {
//               filter.isVerified = isVerified;
//           }

//           return filter;
//       };

//       // **Fetch Professionals**
//       if (!role || role === "professional") {
//           const professionalFilter = createFilter("businessName");
//           console.log("Professional Filter:", professionalFilter);

//           const professionalData = await Professionalinfo.find(professionalFilter)
//               .sort({ createdAt: sortOrder })
//               .skip((pageNumber - 1) * limitNumber)
//               .limit(limitNumber)
//               .lean();

//           console.log("Fetched Professionals:", professionalData.length);

//           const professionalsWithRole = await Promise.all(professionalData.map(async (item) => ({
//               ...item,
//               email: await getEmail(item.userId),
//               role: 'professional'
//           })));

//           data.push(...professionalsWithRole);
//       }

//       // **Fetch Merchants**
//       if (!role || role === "merchant") {
//           const merchantFilter = createFilter("businessName");
//           console.log("Merchant Filter:", merchantFilter);

//           const merchantData = await Merchantinfo.find(merchantFilter)
//               .sort({ createdAt: sortOrder })
//               .skip((pageNumber - 1) * limitNumber)
//               .limit(limitNumber)
//               .lean();

//           console.log("Fetched Merchants:", merchantData.length);

//           const merchantsWithRole = await Promise.all(merchantData.map(async (item) => ({
//               ...item,
//               email: await getEmail(item.userID),
//               role: 'merchant'
//           })));

//           data.push(...merchantsWithRole);
//       }

//       // **Fetch Organizations**
//       if (!role || role === "organization") {
//           const organizationFilter = createFilter("organizationName");
//           console.log("Organization Filter:", organizationFilter);

//           const organizationData = await Organizationinfo.find(organizationFilter)
//               .sort({ createdAt: sortOrder })
//               .skip((pageNumber - 1) * limitNumber)
//               .limit(limitNumber)
//               .lean();

//           console.log("Fetched Organizations:", organizationData.length);

//           const organizationsWithRole = await Promise.all(organizationData.map(async (item) => ({
//               ...item,
//               businessName: item.organizationName, // Rename organizationName to businessName
//               email: await getEmail(item.userID),
//               role: 'organization'
//           })));

//           data.push(...organizationsWithRole);
//       }

//       console.log("Final Data Length:", data.length);

//       return res.status(200).json({
//           success: true,
//           message: "Fetched data successfully",
//           data,
//           pagination: { page: pageNumber, limit: limitNumber }
//       });

//   } catch (error) {
//       console.error("Error fetching data:", error);
//       return res.status(500).json({ success: false, message: "Internal Server Error" });
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
