import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
  getUserOrders,
  editUserProfile,
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/editprofile", authMiddleware, editUserProfile);

// Wishlist Routes
router.get("/wishlist", authMiddleware, getWishlistItems);
router.post("/wishlist/add", authMiddleware, addToWishlist);
router.post("/wishlist/remove", authMiddleware, removeFromWishlist);

// Order Routes
router.get("/orders", authMiddleware, getUserOrders);

// Cart Routes
router.get("/cart", authMiddleware, getCartItems);
router.post("/cart/add", authMiddleware, addToCart);
router.delete("/cart/remove", authMiddleware, removeFromCart);
router.post("/cart/update", authMiddleware, updateCartQuantity);

export default router;
