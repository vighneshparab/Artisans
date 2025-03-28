import express from "express";
import {
  getUserAddress,
  addNewAddress,
  createPaymentIntent,
  placeOrder,
  getUserOrders,
  confirmPayment,
  getSellerOrders,
  updateOrderStatus,
  getOrderDetails,
} from "../controllers/orderController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-address", authMiddleware, getUserAddress);
router.post("/add-address", authMiddleware, addNewAddress);
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);
router.post("/place-order", authMiddleware, placeOrder);
router.get("/user-orders", authMiddleware, getUserOrders);
router.post("/confirm-payment", authMiddleware, confirmPayment);
router.get("/sellerorders", authMiddleware, getSellerOrders);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.get("/:orderId", authMiddleware, getOrderDetails);

export default router;
