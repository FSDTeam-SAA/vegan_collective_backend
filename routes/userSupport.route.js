const express = require("express");
const userCreateSupport = require("../controllers/userSupport.controller");
const router = express.Router();

router.post("/user/create-support", userCreateSupport);

module.exports = router;
