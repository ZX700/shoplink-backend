import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

//
// =========================
// GET ALL PRODUCTS
// SEARCH + FILTER
// =========================
//
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    // SEARCH
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // CATEGORY FILTER
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({
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
        gallery,
        description,
        category,
        stock,

        // seller info
        storeName,
        bankName,
        accountNumber,
        accountName,
        sellerPhone,
        whatsappNumber,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================
      if (!name || !price || !image) {
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

        gallery: gallery || [],

        description,
        category,

        stock: stock || 1,

        sellerId: user._id,
        sellerName: storeName,

        sellerEmail: user.email,

        sellerPhone,
        whatsappNumber,

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

//
// =========================
// EDIT PRODUCT
// SELLER ONLY
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

      // OWNER CHECK
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
// SELLER ONLY
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

      // OWNER CHECK
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
        message: "Product deleted",
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
// REPORT PRODUCT AS SCAM
// =========================
//
router.post(
  "/:id/report-scam",
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

      product.scamReports += 1;

      if (product.scamReports >= 3) {
        product.isScamReported = true;
      }

      await product.save();

      res.json({
        message: "Scam report submitted",
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
// ADD REVIEW
// =========================
//
router.post(
  "/:id/review",
  authMiddleware,
  async (req, res) => {
    try {
      const { rating, comment } = req.body;

      const user = await User.findById(
        req.user.userId
      );

      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      product.reviews.push({
        userId: user._id,
        userName:
          user.name || user.email,
        rating,
        comment,
      });

      // UPDATE AVERAGE
      const total =
        product.reviews.reduce(
          (sum, r) => sum + r.rating,
          0
        );

      product.averageRating =
        total / product.reviews.length;

      await product.save();

      res.json({
        message: "Review added",
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
// ADD COMMENT / CHAT
// =========================
//
router.post(
  "/:id/comment",
  authMiddleware,
  async (req, res) => {
    try {
      const { text } = req.body;

      const user = await User.findById(
        req.user.userId
      );

      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      product.comments.push({
        senderId: user._id,
        senderName:
          user.name || user.email,
        text,
      });

      await product.save();

      res.json({
        message: "Comment added",
        comments: product.comments,
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