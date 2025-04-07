const express = require("express");
const { subscribe, unsubscribe, sendNewsletter } = require("../controllers/newsletterController");

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);
router.post("/send", sendNewsletter);

module.exports = router;
