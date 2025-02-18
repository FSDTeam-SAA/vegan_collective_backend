const express = require("express");
const dbConnection = require("./dbConfig/dbConnection");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authenticateToken = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());


app.use(cors({ origin: "*" }));

const userRoute = require("./routes/user.routes.js");

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


//routes for users
const userProductWishlist = require("./routes/userProductWishlist.route.js");



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

//endpoints for user
app.use("/api/v1", userProductWishlist);





//global routes
app.use("/api/v1", userRoute);

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
