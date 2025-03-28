import express from "express";
import {
  getDashboardStats,
  getSalesData,
  getOrderStatus,
  getTopProducts,
  getSellerPerformance,
  getAllUsers,
  updateUser,
  deleteUser,
  approveSeller,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/AdminMiddleware.js";

const router = express.Router();

// Admin Dashboard Routes
router.get(
  "/dashboard/stats",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);
router.get("/dashboard/sales", authMiddleware, adminMiddleware, getSalesData);
router.get(
  "/dashboard/orders",
  authMiddleware,
  adminMiddleware,
  getOrderStatus
);
router.get(
  "/dashboard/top-products",
  authMiddleware,
  adminMiddleware,
  getTopProducts
);
router.get(
  "/dashboard/seller-performance",
  authMiddleware,
  adminMiddleware,
  getSellerPerformance
);

// User Management Routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.put(
  "/users/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveSeller
);

// Admin Profile Routes
router.get("/profile", authMiddleware, adminMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, adminMiddleware, updateAdminProfile);

export default router;
