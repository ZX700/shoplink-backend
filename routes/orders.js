import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// =========================
// CREATE ORDER
// =========================
router.post("/", async (req, res) => {
  try {
    const {
      productId,
      paymentMethod,
      userEmail,
    } = req.body;

    console.log("📦 ORDER BODY:", req.body);

    // =========================
    // VALIDATION
    // =========================
    if (!productId || !userEmail) {
      return res.status(400).json({
        error: "Missing productId or userEmail",
      });
    }

    // =========================
    // CREATE ORDER
    // =========================
    const order = await Order.create({
      productId,
      paymentMethod: paymentMethod || "stripe",
      userEmail,
      status: "pending",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("❌ ORDER ERROR:", err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

// =========================
// GET ALL ORDERS (DEBUG)
// =========================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();

    return res.json(orders);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to fetch orders",
    });
  }
});

export default router;