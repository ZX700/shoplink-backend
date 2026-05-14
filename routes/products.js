import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      price,
      image,
      description,
      category,
      storeName,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 🔥 AUTO-UPGRADE USER TO SELLER
    if (!user.isSeller) {
      user.isSeller = true;

      user.sellerInfo = {
        storeName: storeName || "",
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        accountName: accountName || "",
      };

      await user.save();
    } else {
      // optional update seller info
      user.sellerInfo = {
        storeName: storeName || user.sellerInfo?.storeName,
        bankName: bankName || user.sellerInfo?.bankName,
        accountNumber:
          accountNumber || user.sellerInfo?.accountNumber,
        accountName: accountName || user.sellerInfo?.accountName,
      };

      await user.save();
    }

    // 🔥 CREATE PRODUCT
    const product = await Product.create({
      name,
      price,
      image,
      description,
      category,
      sellerId: user._id,
      sellerName: user.sellerInfo?.storeName || user.name,
    });

    return res.status(201).json({
      message: "Product uploaded & user upgraded to seller",
      product,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;