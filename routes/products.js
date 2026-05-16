import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

import Product from "../models/Product.js";
import User from "../models/User.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

//
// =========================
// CLOUDINARY CONFIG
// =========================
//
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//
// =========================
// MULTER MEMORY STORAGE
// =========================
//
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

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
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        price,
        description,
        category,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================
      if (!name || !price) {
        return res.status(400).json({
          error: "Missing fields",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Image is required",
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
      // AUTO ACTIVATE SELLER
      // =========================
      user.isSeller = true;

      await user.save();

      // =========================
      // CLOUDINARY STREAM UPLOAD
      // =========================
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream =
            cloudinary.v2.uploader.upload_stream(
              {
                folder: "shoplink-products",
              },

              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer)
            .pipe(stream);
        });
      };

      const result = await streamUpload();

      // =========================
      // CREATE PRODUCT
      // =========================
      const product = await Product.create({
        name,
        price,
        description,
        category,

        image: result.secure_url,

        sellerId: user._id,
        sellerName:
          user.name || user.email,
      });

      // =========================
      // RESPONSE
      // =========================
      res.status(201).json({
        message:
          "Product uploaded successfully",
        product,
      });

    } catch (err) {
      console.error(
        "PRODUCT UPLOAD ERROR:",
        err
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

export default router;