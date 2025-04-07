// const User = require('../models/user.model'); // Import User model
// const commentManipulation = require('../models/commentManipulation.model');
// const Support = require('../models/support.model');
// // Merchant models
// const Merchantinfo = require('../models/merchantInfo.model')
// const MerchantPolicies = require('../models/merchantPolicies.model')
// const Merchantproductdelivary = require('../models/merchantProductDelivary.model')
// const MerchantProducts = require('../models/merchantProducts.model');
// const Merchantproductsreview = require('../models/merchantProductsReview.model')
// const Merchantsalesmanagements = require('../models/merchantSalesManagement.model')
// const Merchantsupport = require('../models/merchantSupport.model')
// const Merchantgolive = require('../models/merchantGoLive.model')
// const Merchantcustomermanagement = require('../models/merchantCustomerManagement.model')

// // organization
// const Organizationeventbooking = require('../models/organizationEventBooking.model')
// const Organizationeventmanagements = require('../models/organizationEventManagement.model')
// const Organizationfundraisingmanagements = require('../models/organizationFundraisingManagement.model')
// const Organizationgolives = require('../models/organizationGoLive.model')
// const Organizationinfos = require('../models/organizationInfo.model')
// const Organizationsupports = require('../models/organizationSupport.model')
// const Organizationupdateandnews = require('../models/organizationUpdateAndNews.model')

// // Professional models
// const ProfessionalFAQ = require('../models/professionalFAQ.model')
// const ProfessionalFAQ = require('../models/professionalFAQ.model')
// const Professionalpolicies = require('../models/professionalPolicies.model')
// const Professionalservicebookings = require('../models/professionalServiceBooking.model')
// const Professionalservices = require('../models/professionalServices.model')

// const Userpayments = require('../models/userPayment.model')
// const Users = require('../models/user.model')



// exports.findByAccountTypeOrId = async (req, res) => {
//   try {
//     const { accountType, userID } = req.query; 

//     // Validate accountType
//     if (!accountType || !userID) {
//       return res.status(400).json({
//         success: false,
//         message: "Both accountType and userID are required in the query.",
//       });
//     }

//     if (!["merchant", "professional", "organization"].includes(accountType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid accountType. Allowed values: merchant, professional, organization.",
//       });
//     }

//     // Find user by accountType and userID
//     const user = await User.findOne({ _id: userID, accountType });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: `No user found with accountType: ${accountType} and userID: ${userID}`,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `User found with accountType: ${accountType} and userID: ${userID}`,
//       data: user,
//     });
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
 