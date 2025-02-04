const express = require("express");
const dbConnection = require("./dbConfig/dbConnection");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const userRoute = require("./routes/user.routes.js");
const reviewRoute = require("./routes/review.routes.js");


app.use("/api", userRoute);
app.use("/api", reviewRoute);



app.get("/", (req, res) => {
  res.status(201).json({
    status: true,
    message: "Welcome to Vegan Collective"
  });
})

app.listen(PORT, async () => {
  await dbConnection();
  console.log(`server is running at http://localhost:${PORT}`);
});