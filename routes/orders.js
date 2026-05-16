import express from "express";
import Order from "../models/Order.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/my-orders",
  authMiddleware,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          userId:
            req.user.userId,
        }).sort({
          createdAt: -1,
        });

      res.json(orders);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

export default router;