import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    stock: { type: Number, required: true, min: 0 },

    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    images: [{ type: String, required: true }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Seller info
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
