import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import upload from "../middlewares/upload.js";
import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import OrderModel from "../models/OrderModel.js";
import path from "path";

// 🔹 Register User
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      storeName,
      storeDescription,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      storeName: role === "seller" ? storeName || "" : undefined,
      storeDescription: role === "seller" ? storeDescription || "" : undefined,
    });

    await user.save();

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "DEFAULT_SECRET_KEY",
      { expiresIn: "1d" }
    );

    const redirectTo =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "seller"
        ? "/seller-dashboard"
        : "/user-dashboard";

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: { id: user._id, role: user.role },
      redirectTo,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// 🔹 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +role");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "DEFAULT_SECRET_KEY",
      { expiresIn: "1d" }
    );

    const redirectTo =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "seller"
        ? "/seller-dashboard"
        : "/user-dashboard";

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, role: user.role },
      redirectTo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

// 🔹 Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

// 🔹 Edit User Profile with Image Upload
export const editUserProfile = async (req, res) => {
  try {
    // Fetch user
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    upload.single("profilePic")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const {
        name,
        email,
        phone,
        address,
        password,
        storeName,
        storeDescription,
      } = req.body;

      // Update basic details
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      // Handle profile picture update
      if (req.file) {
        user.profilePic = req.file.filename;
      }

      // Update seller details if applicable
      if (user.role === "seller") {
        if (storeName) user.storeName = storeName;
        if (storeDescription) user.storeDescription = storeDescription;
      }

      // Update password only if provided
      if (password && password.length >= 6) {
        user.password = await bcrypt.hash(password, 10);
      } else if (password) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long!" });
      }

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profilePic: user.profilePic,
          role: user.role,
          storeName: user.storeName,
          storeDescription: user.storeDescription,
        },
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// 🔹 Wishlist Get
export const getWishlistItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error: error.message,
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const user = await User.findById(req.user.userId);
    const product = await Product.findById(productId); // Fixed variable name

    if (!user || !product) {
      return res.status(404).json({ message: "User or Product not found" });
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔹 Wishlist Management Remove
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const wishlistIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (wishlistIndex === -1) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found in wishlist" });
    }

    user.wishlist.splice(wishlistIndex, 1); // Remove the product from wishlist
    await user.save();

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing product from wishlist",
      error: error.message,
    });
  }
};

// 🔹 Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "orders",
      populate: { path: "items.product" }, // Ensure products inside orders are populated
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Orders fetched successfully",
      orders: user.orders || [],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// 🔹 Get Cart Items
export const getCartItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Cart fetched successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

// 🔹 Add To Cart
export const addToCart = async (req, res) => {
  try {
    let { userId, productId, quantity } = req.body;

    // Validate product ID format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    // Validate user ID format
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    // Convert quantity to an integer
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // Fetch user and product from database
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if product already exists in the user's cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.json({
      success: true,
      message: "Added to cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

// 🔹 Update Cart Item Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(400).json({ message: "Product not found in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    });
  }
};

// 🔹 Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    res.json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
};

// 🔹 Clear Cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};
