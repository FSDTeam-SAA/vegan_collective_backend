const express = require('express');
const getMonthlySalesAndEarnings = require('../controllers/merchantGraph.controller');
const router = express.Router();

router.get("/get/merchant/graph/:userID", getMonthlySalesAndEarnings);

module.exports = router;