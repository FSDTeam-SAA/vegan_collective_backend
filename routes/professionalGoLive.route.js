const express = require('express');
const router = express.Router();
const professionalGoLiveController = require('../controllers/professionalGoLive.controller');

router.post('/professionalGoLive', professionalGoLiveController.createEvent);
router.get('/professionalGoLive', professionalGoLiveController.getAllEvents);
router.get('/professionalGoLive/:id', professionalGoLiveController.getEventById);
router.put('/professionalGoLive/:id', professionalGoLiveController.updateEvent);
router.delete('/professionalGoLive/:id', professionalGoLiveController.deleteEvent);

module.exports = router;
