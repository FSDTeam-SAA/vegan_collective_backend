const Foundervendonmanagement = require('../models/founderVendorManagement.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have this model
const Merchantinfo = require('../models/merchantInfo.model'); // Assuming you have this model
const Organizationinfo = require('../models/organizationInfo.model'); // Assuming you have this model
const User = require('../models/user.model'); // Assuming you have this model
const nodemailer = require('nodemailer'); // For sending emails

exports.fetchRequiredData = async (req, res) => {
    try {
      // Helper function to fetch email from UserModel
      const getEmail = async (userId) => {
        const user = await User.findById(userId, { email: 1 }).lean();
        return user ? user.email : null;
      };
  
      // Fetch professional info and add role: 'professional'
      const professionalData = await Professionalinfo.find(
        {},
        { 
          businessName: 1, 
          createdAt: 1, 
          isVerified: 1, 
          _id: 1, 
          userId: 1,
          address: 1,
          governmentIssuedID: 1, 
          photoWithID: 1, 
          professionalCertification: 1 
        }
      ).lean();
  
      const professionalsWithRole = await Promise.all(professionalData.map(async (item) => {
        const email = await getEmail(item.userId);
        return {
          ...item,
          email,
          role: 'professional',
        };
      }));
  
      // Fetch merchant info and add role: 'merchant'
      const merchantData = await Merchantinfo.find(
        {},
        { 
          businessName: 1, 
          createdAt: 1, 
          isVerified: 1, 
          _id: 1, 
          userID: 1,
          address: 1,
          governmentIssuedID: 1, 
          photoWithID: 1, 
          professionalCertification: 1 
        }
      ).lean();
  
      const merchantsWithRole = await Promise.all(merchantData.map(async (item) => {
        const email = await getEmail(item.userID);
        return {
          ...item,
          email,
          role: 'merchant',
        };
      }));
  
      // Fetch organization info and add role: 'organization'
      const organizationData = await Organizationinfo.find(
        {},
        { 
          organizationName: 1, 
          createdAt: 1, 
          isVerified: 1, 
          _id: 1, 
          userID: 1,
          address: 1,
          governmentIssuedID: 1, 
          photoWithID: 1, 
          professionalCertification: 1 
        }
      ).lean();
  
      const organizationsWithRole = await Promise.all(organizationData.map(async (item) => {
        const email = await getEmail(item.userID);
        return {
          ...item,
          email,
          role: 'organization',
        };
      }));
  
      // Return the combined data with roles and email included
      return res.status(200).json({
        success: true,
        professionalInfo: professionalsWithRole,
        merchantInfo: merchantsWithRole,
        organizationInfo: organizationsWithRole,
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
