import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

//
// =========================
// GET ALL PRODUCTS
// =========================
//
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

//
// =========================
// UPLOAD PRODUCT
// =========================
//
router.post(
  "/upload",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        price,
        image,
        description,
        category,

        // seller info
        storeName,
        bankName,
        accountNumber,
        accountName,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================
      if (
        !name ||
        !price ||
        !image
      ) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // =========================
      // FIND USER
      // =========================
      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // =========================
      // AUTO-CONVERT USER TO SELLER
      // =========================
      user.isSeller = true;

      // store seller info on user profile
      user.storeName = storeName;
      user.bankName = bankName;
      user.accountNumber = accountNumber;
      user.accountName = accountName;

      await user.save();

      // =========================
      // CREATE PRODUCT
      // =========================
      const product = await Product.create({
        name,
        price,
        image,
        description,
        category,

        sellerId: user._id,
        sellerName: storeName,

        bankName,
        accountNumber,
        accountName,
      });

      res.status(201).json({
        message: "Product uploaded successfully",
        product,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

export default router;