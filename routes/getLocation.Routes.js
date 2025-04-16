const express  = require('express');
const getLocation = require('../controllers/getLocation.controller');
const router = express.Router();


router.get("/getlocation", getLocation);

module.exports = router;