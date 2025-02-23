const express = require("express");
const dbConnection = require("./dbConfig/dbConnection");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authenticateToken = require("./middleware/auth.middleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));



//routes for user
const userRoute = require("./routes/user.routes.js");

//routes for founder
const founderVendorManagement = require("./routes/founderVendorManagement.route.js");
const founderVerificationManagement = require("./routes/founderVerificationManagement.route.js");

//routes for professional
const professionalBooking = require("./routes/professionalBooking.route.js");
const professionalEvent = require("./routes/professionalEvent.route.js");
const professionalFAQ = require("./routes/professionalFAQ.route.js");
const professionalGoLive = require("./routes/professionalGoLive.route.js");
const professionalPolicies = require("./routes/professionalPolicies.route.js");
const professionalReview = require("./routes/professionalReview.route.js");
const professionalServices = require("./routes/professionalServices.route.js");
const support = require("./routes/support.route.js");
const professionalInfo = require("./routes/professionalInfo.route.js");

//routes for merchant
const merchantInfo = require("./routes/merchantInfo.route.js");
const merchantProducts = require("./routes/merchantProducts.route.js");
const merchantProductsReview = require("./routes/merchantProductsReview.route.js");
const merchantProductDelivery = require("./routes/merchantProductDelivary.route.js");
const merchantSalesManagement = require("./routes/merchantSalesManagement.route.js");
const merchantCustomerManagement = require("./routes/merchantCustomerManagement.route.js");
const merchantSupport = require("./routes/merchantSupport.routes.js");
const merchantGoLive = require("./routes/merchantGoLive.route.js");

const merchantPolicies = require("./routes/merchantPolicies.route.js");

//routes for organization
const organizationInfo = require("./routes/organizationInfo.route.js");
const organizationUpdateAndNews = require("./routes/organizationUpdateAndNews.route.js");
const commentManipulation = require("./routes/commentManipulation.route.js");
const organizationEventManagement = require("./routes/organizationEventManagement.route.js");
const organizationEventBooking = require("./routes/organizationEventBooking.route.js");
const organizationSupport = require("./routes/organizationSupport.route.js");
const organizationGoLive = require("./routes/organizationGoLive.route.js");
const organizationFundraisingManagement = require("./routes/organizationFundraisingManagement.route.js");

//routes for users
const userProductWishlist = require("./routes/userProductWishlist.route.js");
const userProfile = require("./routes/userProfile.route.js");
const userPayment = require("./routes/userPayment.route.js");
const userSupport = require("./routes/userSupport.route.js");
const userGoLive = require("./routes/userGoLive.route.js");

//endpoints for professional
app.use("/api/v1", professionalBooking);
app.use("/api/v1", professionalEvent);
app.use("/api/v1", professionalFAQ);
app.use("/api/v1", professionalGoLive);
app.use("/api/v1", professionalPolicies);
app.use("/api/v1", professionalReview);
app.use("/api/v1", professionalServices);
app.use("/api/v1", support);
app.use("/api/v1", professionalInfo);

//endpoints for merchant
app.use("/api/v1", merchantInfo);
app.use("/api/v1", merchantProducts);
app.use("/api/v1", merchantProductsReview);
app.use("/api/v1", merchantProductDelivery);
app.use("/api/v1", merchantSalesManagement);
app.use("/api/v1", merchantCustomerManagement);
app.use("/api/v1", merchantSupport);
app.use("/api/v1", merchantGoLive);
app.use("/api/v1", merchantPolicies);

//endpoints for organization
app.use("/api/v1", organizationInfo);
app.use("/api/v1", organizationUpdateAndNews);
app.use("/api/v1", commentManipulation);
app.use("/api/v1", organizationEventManagement);
app.use("/api/v1", organizationEventBooking);
app.use("/api/v1", organizationSupport);
app.use("/api/v1", organizationGoLive);
app.use("/api/v1", organizationFundraisingManagement);

//endpoints for user
app.use("/api/v1", userProductWishlist);
app.use("/api/v1", userProfile);
app.use("/api/v1", userPayment);
app.use("/api/v1", userSupport);
app.use("/api/v1", userGoLive);

//endpoints for founder
app.use("/api/v1", founderVendorManagement);
app.use("/api/v1", founderVerificationManagement);

//global routes
app.use("/api/v1", userRoute);
app.use('/api/v1', require('./routes/globalfind'));

app.get("/api/v1/", (req, res) => {
  res.status(201).json({
    status: true,
    message: "Welcome to Vegan Collective",
  });
});

app.listen(PORT, async () => {
  await dbConnection();
  console.log(`server is running at http://localhost:${PORT}/api/v1`);
});
