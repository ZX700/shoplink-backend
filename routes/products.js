import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// =========================
// GET ALL PRODUCTS
// =========================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// =========================
// UPLOAD PRODUCT (SELLER ONLY)
// =========================
router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const { name, price, image, description, category } = req.body;

    // validate input
    if (!name || !price || !image) {
      return res.status(400).json({
        error: "Name, price, and image are required",
      });
    }

    // get user from JWT
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    if (!user.isSeller) {
      return res.status(403).json({
        error: "Seller account required",
      });
    }

    // create product
    const product = await Product.create({
      name,
      price,
      image,
      description,
      category,
      sellerId: user._id,
      sellerName: user.storeName || user.name,
    });

    return res.status(201).json({
      message: "Product uploaded",
      product,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

export default router;