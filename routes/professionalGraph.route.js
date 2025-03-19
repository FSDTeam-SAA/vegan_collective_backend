const express = require('express');
const getProfessionalGraph = require('../controllers/professionalGraph.controller');
const router = express.Router();

router.get("/get/professional/graph", getProfessionalGraph);

module.exports = router;