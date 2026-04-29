const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// -------------------------
// GET ALL ORDERS
// -------------------------
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// -------------------------
// CREATE ORDER (MISSING BEFORE)
// -------------------------
router.post("/", async (req, res) => {
  try {
    const { productId, paymentMethod, userEmail } = req.body;

    if (!productId || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = new Order({
      productId,
      paymentMethod,
      userEmail,
      status: "pending",
      createdAt: new Date(),
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).json({ error: "Server error creating order" });
  }
});

module.exports = router;