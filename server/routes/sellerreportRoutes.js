import express from "express";
import mongoose from "mongoose";
const router = express.Router();
import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.userId;

    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    let sellerQuery = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    // Fetch total products listed by the seller
    const totalProducts = await Product.countDocuments({ seller: sellerQuery });

    // Fetch seller's product IDs
    const sellerProductIds = await Product.distinct("_id", {
      seller: sellerQuery,
    });

    // Fetch total orders containing seller's products
    const totalOrders = await Order.countDocuments({
      "items.product": { $in: sellerProductIds },
    });

    // Calculate total sales revenue
    const totalSalesResult = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerQuery } },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$productDetails.price"] },
          },
        },
      },
    ]);
    const totalSales =
      totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // 📈 **Enhanced Sales Trend (Hourly Breakdown)**
    const salesTrend = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerQuery } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            hour: { $hour: "$createdAt" },
          },
          sales: {
            $sum: { $multiply: ["$items.quantity", "$productDetails.price"] },
          },
        },
      },
      { $sort: { "_id.date": 1, "_id.hour": 1 } },
    ]);

    // 📊 **Enhanced Orders Trend (Hourly Breakdown)**
    const ordersTrend = await Order.aggregate([
      { $match: { "items.product": { $in: sellerProductIds } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            hour: { $hour: "$createdAt" },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1, "_id.hour": 1 } },
    ]);

    // 📌 **Sales by Product**
    const salesByProduct = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerQuery } },
      {
        $group: {
          _id: "$productDetails.name",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$productDetails.price"] },
          },
          totalOrders: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // 🎯 **Sales by Category**
    const salesByCategory = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerQuery } },
      {
        $group: {
          _id: "$productDetails.category",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$productDetails.price"] },
          },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      salesTrend,
      ordersTrend,
      salesByProduct,
      salesByCategory,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

export default router;
