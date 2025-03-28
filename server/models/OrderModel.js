import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Track seller
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Credit Card", "UPI"],
      required: true,
    },
    transactionId: { type: String },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, default: "IN" },
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Middleware to update product stock after order
OrderSchema.post("save", async function (order) {
  try {
    const Product = mongoose.model("Product");
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }
  } catch (error) {
    console.error("Error updating stock:", error);
  }
});

export default mongoose.model("Order", OrderSchema);
