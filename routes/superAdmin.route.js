const express = require("express");
const { verifierCreate, getAllUsersForSuperAdmin, getAllMerchantsForSuperAdmin, getAllProfessionalsForSuperAdmin, getAllOrganizationsForSuperAdmin, getAllVerifiersForSuperAdmin } = require("../controllers/superAdmin.controller");
const router = express.Router();

//super admin can make change the role of user to verifier
router.put("/superadmin/verifier/roleChange", verifierCreate);

//super admin can get all users with pagination and filter
router.get("/superadmin/getAllUsers", getAllUsersForSuperAdmin);

//super admin can get all merchants with pagination and filter
router.get("/superadmin/getAllMerchants", getAllMerchantsForSuperAdmin);

//super admin can get all professionals with pagination and filter
router.get("/superadmin/getAllProfessionals", getAllProfessionalsForSuperAdmin);

//super admin can get all organizations with pagination and filter
router.get("/superadmin/getAllOrganizations", getAllOrganizationsForSuperAdmin);

//super admin can get all verifiers with pagination and filter
router.get("/superadmin/getAllVerifiers", getAllVerifiersForSuperAdmin);

module.exports = router;