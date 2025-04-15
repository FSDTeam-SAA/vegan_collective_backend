const express = require('express');
const router = express.Router();
const {
  updateUserLocation,
  getUserLocation,
  getVendorsByLocation
} = require('../controllers/geolocation.controller.js');

router.put('/:userId', updateUserLocation);
router.get('/vendors', getVendorsByLocation);
router.get('/:userId', getUserLocation);

module.exports = router;
