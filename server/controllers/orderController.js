import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * ✅ Get User Address
 * Fetches the saved address of the logged-in user.
 */
export const getUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, address: user.address || [], phone: user.phone });
  } catch (err) {
    console.error("Get Address Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * ✅ Add New Address
 * Adds a new address for the logged-in user.
 */
export const addNewAddress = async (req, res) => {
  const { street, city, state, zip } = req.body;
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.address) {
      user.address = [];
    }

    user.address.push({ street, city, state, zip });
    await user.save();

    res.json({ success: true, message: "Address added successfully" });
  } catch (err) {
    console.error("Add Address Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * ✅ Create Stripe Payment Intent
 * Generates a Stripe payment intent for online payments.
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, customerAddress, userName } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    if (
      !customerAddress ||
      !customerAddress.line1 ||
      !customerAddress.city ||
      !customerAddress.state ||
      !customerAddress.postal_code ||
      !userName
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name and complete address are required.",
      });
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount * 100, // Convert INR to paisa
      currency: "inr",
      payment_method_types: ["card"],
      description: "Order Payment",
      shipping: {
        name: userName,
        address: {
          line1: customerAddress.line1,
          city: customerAddress.city,
          state: customerAddress.state,
          postal_code: customerAddress.postal_code,
          country: "IN",
        },
      },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Intent Error:", error);

    // Improved error handling
    if (error.type === "StripeCardError") {
      res.status(400).json({
        success: false,
        message: "Card declined.",
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Payment error",
        error: error.message,
      });
    }
  }
};

/**
 * ✅ Place Order (COD & Online)
 * Saves order details in the database.
 */

export const placeOrder = async (req, res) => {
  const { cartItems, totalAmount, address, paymentMethod, paymentIntentId } =
    req.body;
  let transactionId = null;

  try {
    if (paymentMethod !== "COD") {
      try {
        const paymentIntent = await stripeInstance.paymentIntents.retrieve(
          paymentIntentId
        );
        if (paymentIntent.status !== "succeeded") {
          return res
            .status(400)
            .json({ success: false, message: "Payment verification failed" });
        }
        transactionId = paymentIntent.id;
      } catch (stripeError) {
        console.error("Stripe API Error:", stripeError);
        return res.status(500).json({
          success: false,
          message: "Stripe API error",
          error: stripeError.message,
        });
      }
    }

    // Validate Inputs
    if (!cartItems || cartItems.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty!" });
    if (!totalAmount || totalAmount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid total amount" });
    if (!address?.street || !address?.city || !address?.state || !address?.zip)
      return res
        .status(400)
        .json({ success: false, message: "Invalid address details" });

    const structuredAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.zip,
      country: "IN",
    };

    // Fetch User Details
    const user = await User.findById(req.user.userId).select("email name");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Create New Order
    const newOrder = new Order({
      user: req.user.userId,
      items: cartItems,
      totalAmount,
      paymentMethod,
      transactionId,
      deliveryAddress: structuredAddress,
    });
    const savedOrder = await newOrder.save();

    // Update User Orders
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { orders: savedOrder._id },
    });

    console.log("Fetched User Email:", user.email);

    // Send Invoice Email with Complete Order Details
    await sendInvoiceEmail(user, savedOrder, cartItems);

    res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.error("Place Order Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * ✅ Email
 * Saves order details in the database.
 */
const sendInvoiceEmail = async (user, orderDetails, cartItems) => {
  try {
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          name: product?.name || "Unknown Product",
          price: product?.price || 0,
          quantity: item.quantity,
          total: (product?.price || 0) * item.quantity,
        };
      })
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `ShopMate <${process.env.NODEMAILER_EMAIL}>`,
      to: user.email,
      subject: `Invoice for Your Order #${orderDetails._id}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #004D40; text-align: center;">🛒 ArtisanShop Invoice</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your purchase! Here are your order details:</p>
        <p><strong>Order ID:</strong> ${orderDetails._id}</p>
        <p><strong>Order Date:</strong> ${new Date(
          orderDetails.createdAt
        ).toDateString()}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Address:</strong> ${orderDetails.deliveryAddress.street}, ${
        orderDetails.deliveryAddress.city
      }, ${orderDetails.deliveryAddress.state}, ${
        orderDetails.deliveryAddress.postal_code
      }, ${orderDetails.deliveryAddress.country}</p>
        <h3 style="color: #004D40; text-align: center;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #004D40; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">#</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsWithDetails
              .map(
                (item, index) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  index + 1
                }</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  item.name
                }</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${
                  item.price
                }</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${
                  item.quantity
                }</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${
                  item.total
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <h3 style="text-align: right; padding-right: 20px;">Total: ₹${orderDetails.totalAmount.toFixed(
          2
        )}</h3>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Happy Shopping! 🎉</p>
      </div>`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};

/**
 * ✅ Get User Orders
 * Fetches all orders placed by the logged-in user.
 */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product"
    );
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * ✅ Confirm Payment
 * Verifies the payment status using Stripe.
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (
      !paymentIntentId ||
      typeof paymentIntentId !== "string" ||
      paymentIntentId.trim() === ""
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Payment Intent ID" });
    }

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      res.json({
        success: true,
        message: "Payment successful!",
        transactionId: paymentIntent.id,
      });
    } else {
      res.json({ success: false, message: "Payment failed or not completed." });
    }
  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
    });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Order.find({
      "items.seller": sellerId,
    })
      .populate("user", "name email") // Populate user details
      .populate("items.product", "name price") // Populate product details
      .exec();

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Shipped", "Delivered", "Canceled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 🔹 Fetch order with user, product, and seller details
    const order = await Order.findById(orderId)
      .populate("user", "name email phone") // Fetch user details
      .populate("items.product", "name price images") // Fetch product details
      .populate("items.seller", "name email storeName"); // Fetch seller details

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
