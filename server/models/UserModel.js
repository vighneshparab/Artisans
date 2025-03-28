import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    profilePic: { type: String, default: "default.png" },

    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },

    permissions: {
      type: [String],
      enum: [
        "manage-users",
        "manage-products",
        "manage-orders",
        "approve-sellers",
      ],
      default: function () {
        return this.role === "admin"
          ? [
              "manage-users",
              "manage-products",
              "manage-orders",
              "approve-sellers",
            ]
          : [];
      },
    },

    isVerified: { type: Boolean, default: false },
    storeName: {
      type: String,
      required: function () {
        return this.role === "seller";
      },
    },
    storeDescription: { type: String },
    storeLogo: { type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    status: { type: String, enum: ["active", "banned"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
