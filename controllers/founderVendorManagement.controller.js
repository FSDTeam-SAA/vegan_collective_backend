const Foundervendonmanagement = require('../models/founderVendorManagement.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have this model
const Merchantinfo = require('../models/merchantInfo.model'); // Assuming you have this model
const Organizationinfo = require('../models/organizationInfo.model'); // Assuming you have this model

// Function to get professional info
exports.getProfessionalInfo = async (req, res) => {
    try {
        const founderManagement = await Foundervendonmanagement.findOne().populate('professional');
        if (!founderManagement) {
            return res.status(404).json({ message: "No professional info found" });
        }
        const professionals = await Professionalinfo.find({
            '_id': { $in: founderManagement.professional }
        }).select('businessName createdAt isVerified');
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to get merchant info
exports.getMerchantInfo = async (req, res) => {
    try {
        const founderManagement = await Foundervendonmanagement.findOne().populate('merchants');
        if (!founderManagement) {
            return res.status(404).json({ message: "No merchant info found" });
        }
        const merchants = await Merchantinfo.find({
            '_id': { $in: founderManagement.merchants }
        }).select('businessName createdAt isVerified');
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to get organization info
exports.getOrganizationInfo = async (req, res) => {
    try {
        const founderManagement = await Foundervendonmanagement.findOne().populate('organizations');
        if (!founderManagement) {
            return res.status(404).json({ message: "No organization info found" });
        }
        const organizations = await Organizationinfo.find({
            '_id': { $in: founderManagement.organizations }
        }).select('organizationName createdAt isVerified');
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};