const MerchantProducts = require("../models/merchantProducts.model");
const cloudinary = require("cloudinary").v2;

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { merchantID, productName, description, metaDescription, price, stockQuantity, category, tags, visibility } = req.body;
    
    // Validate merchantID
    if (!merchantID) return res.status(400).json({ message: "Merchant ID is required" });

    // Upload Image to Cloudinary
    let productImage = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      productImage = result.secure_url;
    }

    // Set stock status
    let stockStatus = "out of stock";
    if (stockQuantity >= 20) stockStatus = "in stock";
    else if (stockQuantity > 0 && stockQuantity < 20) stockStatus = "low stock";

    const visibilityValue = visibility === undefined || visibility === null ? true : visibility;


    const newProduct = new MerchantProducts({
      merchantID,
      productName,
      description,
      metaDescription,
      price,
      stockQuantity,
      category,
      tags,
      productImage,
      visibility: visibilityValue,
      stockStatus,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get All Products (Only Visible)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await MerchantProducts.find({ visibility: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await MerchantProducts.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { stockQuantity } = req.body;

    let updatedData = { ...req.body };

    // Update Image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedData.productImage = result.secure_url;
    }

    // Update Stock Status
    if (stockQuantity !== undefined) {
      if (stockQuantity >= 20) updatedData.stockStatus = "in stock";
      else if (stockQuantity > 0) updatedData.stockStatus = "low stock";
      else updatedData.stockStatus = "out of stock";
    }

    const updatedProduct = await MerchantProducts.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await MerchantProducts.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
