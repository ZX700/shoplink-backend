import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// =========================
// CLOUDINARY CONFIG
// =========================
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =========================
// MULTER (memory storage)
// =========================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =========================
// UPLOAD PRODUCT IMAGE
// =========================
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, description, category } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Image required" });
      }

      // upload to cloudinary
      const result = await cloudinary.v2.uploader.upload_stream(
        {
          folder: "products",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: "Cloudinary upload failed" });
          }

          const product = await Product.create({
            name,
            price,
            description,
            category,
            image: result.secure_url,
            sellerId: req.user.userId,
          });

          res.status(201).json({
            message: "Product uploaded",
            product,
          });
        }
      );

      // send buffer to cloudinary stream
      result.end(req.file.buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;