import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/setup", authMiddleware, async (req, res) => {
  try {
    const {
      storeName,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
         });
    }

    user.isSeller = true;
    user.storeName = storeName;
    user.bankName = bankName;
    user.accountNumber = accountNumber;
    user.accountName = accountName;

    await user.save();

    res.json({
      message: "Seller account created",
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

export default router;