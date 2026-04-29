import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// -------------------------
// ORDER SCHEMA
// -------------------------
const orderSchema = new mongoose.Schema({
  productId: String,
  paymentMethod: String,
  userEmail: String,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

// -------------------------
// CREATE ORDER
// -------------------------
router.post("/", async (req, res) => {
  try {
    const { productId, paymentMethod, userEmail } = req.body;

    console.log("ORDER BODY:", req.body);

    if (!productId || !userEmail) {
      return res.status(400).json({
        error: "Missing productId or userEmail",
      });
    }

    const order = new Order({
      productId,
      paymentMethod,
      userEmail,
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;