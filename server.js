const express = require("express");
const dbConnection = require("./dbConfig/dbConnection");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authenticateToken = require("./middleware/auth.middleware");
const refferRoutes = require("./routes/refferRoutes");
const session = require("express-session");
const passport = require("passport");
const smsRoutes = require("./routes/smsRoutes.js");
const zoomRoutes = require("./routes/zoomRoutes");
const organizationVolunteerRoutes = require("./routes/organizationVolunteer.route.js");
const eventRoutes = require("./routes/eventRoutes.js");
const merchantBookingRoutes = require("./routes/merchantBooking.route.js");
const getUserOverview = require('./routes/userOverviewRoutes');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// Existing routes
const userRoute = require("./routes/user.routes.js");
const founderVendorManagement = require("./routes/founderVendorManagement.route.js");
const founderVerificationManagement = require("./routes/founderVerificationManagement.route.js");
const professionalBooking = require("./routes/professionalBooking.route.js");
const professionalEvent = require("./routes/professionalEvent.route.js");
const professionalFAQ = require("./routes/professionalFAQ.route.js");
const professionalGoLive = require("./routes/professionalGoLive.route.js");
const professionalPolicies = require("./routes/professionalPolicies.route.js");
const professionalReview = require("./routes/professionalReview.route.js");
const professionalServices = require("./routes/professionalServices.route.js");
const support = require("./routes/support.route.js");
const professionalInfo = require("./routes/professionalInfo.route.js");
const getProfessionalGraph = require("./routes/professionalGraph.route.js");

const merchantInfo = require("./routes/merchantInfo.route.js");
const merchantProducts = require("./routes/merchantProducts.route.js");
const merchantProductsReview = require("./routes/merchantProductsReview.route.js");
const merchantProductDelivery = require("./routes/merchantProductDelivary.route.js");
const merchantSalesManagement = require("./routes/merchantSalesManagement.route.js");
const merchantCustomerManagement = require("./routes/merchantCustomerManagement.route.js");
const merchantSupport = require("./routes/merchantSupport.routes.js");
const merchantGoLive = require("./routes/merchantGoLive.route.js");
const merchantGraph = require("./routes/merchantGraph.route.js");
const storeReviewForMerchant = require("./routes/storeReviewForMerchant.route.js");
const merchantPolicies = require("./routes/merchantPolicies.route.js");
const merchantStripe = require("./routes/merchantStripe.route.js");

const organizationInfo = require("./routes/organizationInfo.route.js");
const organizationUpdateAndNews = require("./routes/organizationUpdateAndNews.route.js");
const commentManipulation = require("./routes/commentManipulation.route.js");
const organizationEventManagement = require("./routes/organizationEventManagement.route.js");
const organizationEventBooking = require("./routes/organizationEventBooking.route.js");
const organizationSupport = require("./routes/organizationSupport.route.js");
const organizationGoLive = require("./routes/organizationGoLive.route.js");
const organizationFundraisingManagement = require("./routes/organizationFundraisingManagement.route.js");
const organizationReview = require("./routes/organizationReview.route.js");

const userProductWishlist = require("./routes/userProductWishlist.route.js");
const userProfile = require("./routes/userProfile.route.js");
const userPayment = require("./routes/userPayment.route.js");
const userSupport = require("./routes/userSupport.route.js");
const userGoLive = require("./routes/userGoLive.route.js");


const paymentRoute = require("./routes/payment.Routes.js");
const googleAuthRoute = require("./routes/googleAuth.js");
const checkUserPaymentRoute = require("./routes/checkUserPayment.route.js");
const userPaymentDetailsRoute = require("./routes/userPaymentDetails.route.js");
const newsletterRoutes = require("./routes/newsletterRoutes");

//route for super Admin
const superAdminRoute = require("./routes/superAdmin.route.js");
const superAdminRoutes = require('./routes/superAdminAuthRoute');

// New Google Meet routes

const calendarRoutes = require("./routes/calendar.Routes.js");

const geolocationRoutes = require('./routes/geolocation.route');

const locationRoutes = require("./routes/getLocation.Routes.js");

//super admin 
app.use("/api/v1", superAdminRoutes);

// Route handlers

app.use("/api", calendarRoutes);
app.use("/api/v1", professionalBooking);
app.use("/api/v1", professionalEvent);
app.use("/api/v1", professionalFAQ);
app.use("/api/v1", professionalGoLive);
app.use("/api/v1", professionalPolicies);
app.use("/api/v1", professionalReview);
app.use("/api/v1", professionalServices);
app.use("/api/v1", support);
app.use("/api/v1", professionalInfo);
app.use("/api/v1", getProfessionalGraph);

app.use("/api/v1", merchantInfo);
app.use("/api/v1", merchantProducts);
app.use("/api/v1", merchantProductsReview);
app.use("/api/v1", merchantProductDelivery);
app.use("/api/v1", merchantSalesManagement);
app.use("/api/v1", merchantCustomerManagement);
app.use("/api/v1", merchantSupport);
app.use("/api/v1", merchantGoLive);
app.use("/api/v1", merchantPolicies);
app.use("/api/v1", merchantStripe);
app.use("/api/v1", merchantBookingRoutes);
app.use("/api/v1", merchantGraph);
app.use("/api/v1", storeReviewForMerchant);

app.use("/api/v1", organizationInfo);
app.use("/api/v1", organizationUpdateAndNews);
app.use("/api/v1", commentManipulation);
app.use("/api/v1", organizationEventManagement);
app.use("/api/v1", organizationEventBooking);
app.use("/api/v1", organizationSupport);
app.use("/api/v1", organizationGoLive);
app.use("/api/v1", organizationFundraisingManagement);
app.use("/api/v1", organizationReview);

app.use("/api/v1", userProductWishlist);
app.use("/api/v1", userProfile);
app.use("/api/v1", userPayment);
app.use("/api/v1", userSupport);
app.use("/api/v1", userGoLive);
app.use('/api/v1', getUserOverview);

app.use("/api/v1", founderVendorManagement);
app.use("/api/v1", founderVerificationManagement);
app.use("/api/v1", userPaymentDetailsRoute);
app.use("/api/v1", userRoute);

// Global routes
app.use("/api/v1/auth/zoom", zoomRoutes);
app.use("/api/v1", refferRoutes);
app.use("/api/v1/sms", smsRoutes);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/payment", checkUserPaymentRoute);
app.use("/api/v1", googleAuthRoute);
app.use("/api/v1", organizationVolunteerRoutes);
app.use("/api/v1", newsletterRoutes);
app.use("/api/v1", eventRoutes);



// Google Meet routes - prefixed with /api/v1 to match your structure

// Handle auth callback separately if needed


// All API routes prefixed with /api

// Static files
app.use(express.static(path.join(__dirname, "public")));

//API Routes for super admin
app.use("/api/v1/", superAdminRoute);

app.use('/api/v1/geolocation', geolocationRoutes);

app.use("/api/v1", locationRoutes);

// Serve frontend
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "meet.html"));
// });

// Root route
app.get("/", (req, res) => {
  res.send("Vegan Collective Server with Zoom and Google Meet Integration");
});



app.get("/api/v1", (req, res) => {
  res.status(201).json({
    status: true,
    message: "Welcome to Vegan Collective",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, async () => {
  await dbConnection();
  console.log(`Server is running at http://localhost:${PORT}/api/v1`);
});
