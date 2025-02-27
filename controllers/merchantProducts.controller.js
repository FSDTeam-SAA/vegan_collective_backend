const MerchantProducts = require("../models/merchantProducts.model");
const cloudinary = require("cloudinary").v2;

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { merchantID, productName, description, metaDescription, price, stockQuantity, category, tags, visibility } = req.body;
    if (!merchantID) return res.status(400).json({ success: false, message: "Merchant ID is required", data: [] });

    // Ensure tags is a valid array
    const tagsArray =
      typeof tags === "string"
        ? JSON.parse(tags) // If tags is a stringified array, parse it
        : Array.isArray(tags)
        ? tags
        : [];

    let productImage = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      productImage = result.secure_url;
    }

    let stockStatus = "out of stock";
    if (stockQuantity >= 20) stockStatus = "in stock";
    else if (stockQuantity > 0) stockStatus = "low stock";

    const visibilityValue = visibility !== undefined ? visibility : true;

    const newProduct = new MerchantProducts({
      merchantID,
      productName,
      description,
      metaDescription,
      price,
      stockQuantity,
      category,
      tags: tagsArray, // Ensures tags are properly formatted
      productImage,
      visibility: visibilityValue,
      stockStatus,
    });

    await newProduct.save();

    // Ensure data is always an array of objects
    res.status(201).json({ success: true, message: "Product created successfully", data: [newProduct] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// Get All Products with Pagination, Search, and Sorting
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "asc", merchantID, category } = req.query;
    const query = {};

    // Filter by merchantID if provided
    if (merchantID) {
      query.merchantID = merchantID;
    }

    // Filter by category if provided
    if (category) {
      query.category = category; // Assuming your product schema has a `category` field
    }

    // Search by product name (case-insensitive)
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    // Sorting logic (ascending or descending)
    const sortOrder = sort === "desc" ? -1 : 1;

    // Get paginated products
    const products = await MerchantProducts.find(query)
      .sort({ price: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Total items count
    const totalItems = await MerchantProducts.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Ensure data is always an array of objects
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products.map((product) => ({ ...product.toObject() })), // Ensure each item is an object
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// Get All Products with visibility true with Pagination, Search, and Sorting
exports.getAllProductsVisibilityTrue = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "asc", merchantID } = req.query;
    const query = { visibility: true };

    // Filter by merchantID if provided
    if (merchantID) {
      query.merchantID = merchantID;
    }

    // Search by product name (case-insensitive)
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    // Sorting logic (ascending or descending)
    const sortOrder = sort === "desc" ? -1 : 1;

    // Get paginated products
    const products = await MerchantProducts.find(query)
      .sort({ price: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Total items count
    const totalItems = await MerchantProducts.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Ensure data is always an array of objects
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products.map((product) => ({ ...product.toObject() })), // Ensure each item is an object
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await MerchantProducts.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found", data: [] });

    // Ensure data is always an array of objects
    res.status(200).json({ success: true, message: "Product fetched successfully", data: [{ ...product.toObject() }] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { stockQuantity, tags } = req.body;
    let updatedData = { ...req.body };

    // Ensure tags is a valid array
    if (tags) {
      updatedData.tags =
        typeof tags === "string"
          ? JSON.parse(tags) // If tags is a stringified array, parse it
          : Array.isArray(tags)
          ? tags
          : [];
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedData.productImage = result.secure_url;
    }

    if (stockQuantity !== undefined) {
      if (stockQuantity >= 20) updatedData.stockStatus = "in stock";
      else if (stockQuantity > 0) updatedData.stockStatus = "low stock";
      else updatedData.stockStatus = "out of stock";
    }

    const updatedProduct = await MerchantProducts.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found", data: [] });

    // Ensure data is always an array of objects
    res.status(200).json({ success: true, message: "Product updated successfully", data: [{ ...updatedProduct.toObject() }] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await MerchantProducts.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found", data: [] });

    // Ensure data is always an array of objects
    res.status(200).json({ success: true, message: "Product deleted successfully", data: [{ ...product.toObject() }] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};