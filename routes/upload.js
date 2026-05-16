import express from "express";
import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

const router = express.Router();

// =========================
// CLOUDINARY CONFIG
// =========================
cloudinary.v2.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// =========================
// STORAGE
// =========================
const storage =
  new CloudinaryStorage({
    cloudinary: cloudinary.v2,

    params: {
      folder: "shoplink",
      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp",
      ],
    },
  });

const upload = multer({
  storage,
});

// =========================
// UPLOAD ROUTE
// =========================
router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      res.json({
        imageUrl: req.file.path,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        error: "Upload failed",
      });
    }
  }
);

export default router;