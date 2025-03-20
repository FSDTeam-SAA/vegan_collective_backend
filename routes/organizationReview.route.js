const express = require("express");
const { createOrganizationReview, getAverageRating, getAllReviewsForSpecificOrganization, getTopOrganizations } = require("../controllers/organizationReview.controller");
const router = express.Router();

router.post("/organization/review/create", createOrganizationReview);

router.get("/organization/review/average/:organizationID", getAverageRating);

router.get("/organization/review/all/:organizationID", getAllReviewsForSpecificOrganization);

router.get("/organization/review/top", getTopOrganizations);

module.exports = router;