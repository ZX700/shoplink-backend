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
// GET SINGLE PRODUCT
// =========================
//
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(product);

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

        // seller
        storeName,
        sellerName,
        bankName,
        accountNumber,
        accountName,
        phoneNumber,
      } = req.body;

      if (!name || !price || !image) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // auto seller
      user.isSeller = true;

      user.storeName = storeName;
      user.bankName = bankName;
      user.accountNumber = accountNumber;
      user.accountName = accountName;
      user.phoneNumber = phoneNumber;

      await user.save();

      const product = await Product.create({
        name,
        price,
        image,
        description,
        category,

        sellerId: user._id,

        sellerName,
        storeName,
        bankName,
        accountNumber,
        accountName,
        phoneNumber,
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

//
// =========================
// UPDATE PRODUCT
// =========================
//
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      // only seller owner can edit
      if (
        String(product.sellerId) !==
        String(req.user.userId)
      ) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

      res.json({
        message: "Product updated",
        product: updated,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

//
// =========================
// DELETE PRODUCT
// =========================
//
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      // only seller owner can delete
      if (
        String(product.sellerId) !==
        String(req.user.userId)
      ) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }

      await Product.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Product deleted successfully",
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