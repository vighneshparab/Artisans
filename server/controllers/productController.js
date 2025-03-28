import Product from "../models/ProductModel.js";
import { uploadMultiple } from "../middlewares/upload.js";
import path from "path";

// 🔹 Add a Product (Only for Sellers)
export const addProduct = async (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      if (req.user.role !== "seller")
        return res.status(403).json({ message: "Access Denied" });

      const { name, description, price, stock, category, subcategory } =
        req.body;

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one image is required" });
      }

      // 🔹 Extract only filenames instead of full paths
      const images = req.files.map((file) => path.basename(file.path));

      const product = new Product({
        name,
        description,
        price,
        stock,
        category,
        subcategory,
        images,
        seller: req.user.userId,
      });

      await product.save();
      res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
      res.status(500).json({ message: "Error adding product", error });
    }
  });
};

// 🔹 Update Product (Only Seller Can Update)
export const updateProduct = async (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (product.seller.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { name, description, price, stock, category, subcategory } =
        req.body;

      if (req.files && req.files.length > 0) {
        product.images = req.files.map((file) => path.basename(file.path));
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.stock = stock || product.stock;
      product.category = category || product.category;
      product.subcategory = subcategory || product.subcategory;

      await product.save();
      res.json({ message: "Product updated successfully", product });
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error });
    }
  });
};

// 🔹 Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// 🔹 Get a Single Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// 🔹 Delete Product (Only Seller Can Delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// 🔹 Get Related Products by Category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).limit(6);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No related products found" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching related products", error });
  }
};
