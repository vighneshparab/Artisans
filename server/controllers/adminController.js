import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import bcrypt from "bcryptjs";

// 📊 Get Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalSales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalSales: totalSales.length ? totalSales[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// 📈 Get Sales Data for Graphs
export const getSalesData = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailySales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ monthlySales, dailySales });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
};

// 📦 Get Order Status Data
export const getOrderStatus = async (req, res) => {
  try {
    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(orderStatus);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order status data" });
  }
};

// 🔝 Get Top Selling Products
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: "$product.name",
          totalSold: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
};

// 🏪 Get Seller Performance Data
export const getSellerPerformance = async (req, res) => {
  try {
    const sellerPerformance = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.seller",
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          _id: 1,
          name: "$seller.name",
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    res.json(sellerPerformance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seller performance data" });
  }
};

// 👥 Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// 📝 Update User
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// ❌ Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ Approve Seller
export const approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "seller") {
      return res.status(400).json({ error: "User is not a seller" });
    }

    user.status = "active";
    await user.save();
    res.json({ message: "Seller approved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve seller" });
  }
};

// 🔑 Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId).select("-password");
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ✏️ Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const { name, email, password, profilePic, isVerified, status } = req.body;

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.profilePic = profilePic || admin.profilePic;
    admin.isVerified = isVerified !== undefined ? isVerified : admin.isVerified;
    admin.status = status || admin.status;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();
    res.json({ message: "Profile updated successfully", admin });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
