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
const merchantProducts = require("./routes/merchantProducts.route.js");
const merchantPolicies = require("./routes/merchantPolicies.route.js");
const merchantGoLive = require("./routes/merchantGoLive.route.js");
app.use("/api/v1", userRoute);

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
app.use("/api/v1", merchantProducts);
app.use("/api/v1", merchantPolicies);
app.use("/api/v1", merchantGoLive);

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
