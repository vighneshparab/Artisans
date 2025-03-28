import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getProductsByCategory } from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/category/:category", getProductsByCategory);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
