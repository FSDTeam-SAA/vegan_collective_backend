const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const merchantProductsController = require("../controllers/merchantProducts.controller");

// Create a new product (Image Upload Supported)
router.post("/merchantProduct", upload.single("productImage"), merchantProductsController.createProduct);

// Get all products
router.get("/merchantProduct", merchantProductsController.getAllProducts);

// Get all visible products
router.get("/merchantProductVisibilityTrue", merchantProductsController.getAllProductsVisibilityTrue);

// Get a single product by ID
router.get("/merchantProduct/:id", merchantProductsController.getProductById);


// Update a product (Image Upload Supported)
router.put("/merchantProduct/:id", upload.single("productImage"), merchantProductsController.updateProduct);

// Delete a product
router.delete("/merchantProduct/:id", merchantProductsController.deleteProduct);

// get product by merchantId
router.get('/products', merchantProductsController.getProductsByMerchant) // Define the route

module.exports = router;
