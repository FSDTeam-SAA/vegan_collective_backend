const express = require("express");
const { createOrganizationReview, getAverageRating, getAllReviewsForSpecificOrganization } = require("../controllers/organizationReview.controller");
const router = express.Router();

router.post("/organization/review/create", createOrganizationReview);

router.get("/organization/review/average/:organizationID", getAverageRating);

router.get("/organization/review/all/:organizationID", getAllReviewsForSpecificOrganization);

module.exports = router;