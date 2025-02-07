const express = require("express");
const dbConnection = require("./dbConfig/dbConnection");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));

const userRoute = require("./routes/user.routes.js");
const reviewRoute = require("./routes/review.routes.js");
const customerCommunication = require("./routes/customerCommunication.routes.js");
const delivaryManagement = require("./routes/delivaryManagement.routes.js");
const merchantGoLive = require("./routes/merchantGoLive.routes.js");
const merchantHelpAndSupport = require("./routes/merchantHelpAndSupport.routes.js");
const merchantInfo = require("./routes/merchantInfo.routes.js");
const orderDelivaryStatus = require("./routes/orderDelivaryStatus.routes.js");
const orderSalesStatus = require("./routes/orderSalesStatus.routes.js");
const organizationInfo = require("./routes/organizationInfo.routes.js");
const productManagement = require("./routes/productManagement.routes.js");
const productOrder = require("./routes/productOrder.routes.js");
const professionalClientInteraction = require("./routes/professionalClientInteraction.routes.js");
const professionalFAQ = require("./routes/professionalFAQ.routes.js");
const professionalGoLive = require("./routes/professionalGoLive.routes.js");
const professionalHelpAndSupport = require("./routes/professionalHelpAndSupport.routes.js");
const professionalInfo = require("./routes/professionalInfo.routes.js");
const professionalPolicies = require("./routes/professionalPolicies.routes.js");
const professionalServices = require("./routes/professionalServices.routes.js");
const salesManagement = require("./routes/salesManagement.routes.js");
const vendorManagement = require("./routes/vendorManagement.routes.js");
const vendorVerification = require("./routes/vendorVerification.routes.js");
const founderSupportandHelp = require("./routes/founderSupportandHelp.routes.js");

app.use("/api/v1", userRoute);
app.use("/api/v1", reviewRoute);
app.use("/api/v1", customerCommunication);
app.use("/api/v1", delivaryManagement);
app.use("/api/v1", merchantGoLive);
app.use("/api/v1", merchantHelpAndSupport);
app.use("/api/v1", merchantInfo);
app.use("/api/v1", orderDelivaryStatus);
app.use("/api/v1", orderSalesStatus);
app.use("/api/v1", organizationInfo);
app.use("/api/v1", productManagement);
app.use("/api/v1", productOrder);
app.use("/api/v1", professionalClientInteraction);
app.use("/api/v1", professionalFAQ);
app.use("/api/v1", professionalGoLive);
app.use("/api/v1", professionalHelpAndSupport);
app.use("/api/v1", professionalInfo);
app.use("/api/v1", professionalPolicies);
app.use("/api/v1", professionalServices);
app.use("/api/v1", salesManagement);
app.use("/api/v1", vendorManagement);
app.use("/api/v1", vendorVerification);
app.use("/api/v1", founderSupportandHelp);

app.get("/api/v1/", (req, res) => {
  res.status(201).json({
    status: true,
    message: "Welcome to Vegan Collective",
  });
});

app.listen(PORT, async () => {
  await dbConnection();
  console.log(`server is running at http://localhost:${PORT}`);
});
