import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middlewares/authMiddleware.js";
import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { sellerId } = req.query;

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Valid Seller ID is required" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Find all products belonging to the seller
    const sellerProducts = await Product.find({
      seller: sellerObjectId,
    }).select("_id");

    if (sellerProducts.length === 0) {
      return res.json({ orders: [] });
    }

    const productIds = sellerProducts.map((product) => product._id);

    // Fetch orders containing these products
    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).populate("items.product", "name price");

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

// Update Order Status
router.put("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, sellerId } = req.body;

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Valid Seller ID is required" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Check if seller owns any product in this order
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });

    const sellerProducts = await Product.find({
      seller: sellerObjectId,
    }).select("_id");
    const productIds = sellerProducts.map((product) => product._id);

    const sellerHasProducts = order.items.some((item) =>
      productIds.includes(item.product.toString())
    );

    if (!sellerHasProducts) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this order" });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

// Delete Order (Only if seller's products are present)
router.delete("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sellerId } = req.body;

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Valid Seller ID is required" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });

    const sellerProducts = await Product.find({
      seller: sellerObjectId,
    }).select("_id");
    const productIds = sellerProducts.map((product) => product._id);

    const sellerHasProducts = order.items.some((item) =>
      productIds.includes(item.product.toString())
    );

    if (!sellerHasProducts) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this order" });
    }

    await Order.findByIdAndDelete(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

export default router;
