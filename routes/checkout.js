import express from "express";
import Stripe from "stripe";
import { authMiddleware } from "../middleware/auth.js";
import Order from "../models/Order.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

//
// =========================
// STRIPE CHECKOUT
// =========================
//
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
  try {
    const { items } = req.body;

    console.log("CHECKOUT BODY:", req.body);

    // =========================
    // VALIDATION
    // =========================
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "No items provided",
      });
    }

    // =========================
    // CREATE STRIPE LINE ITEMS
    // =========================
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",

        product_data: {
          name: item.name,
          description:
            item.description ||
            "ShopLink Product",
          images: Array.isArray(item.image)
            ? item.image
            : [item.image],
        },

        unit_amount: Math.round(
          Number(item.price) * 100
        ),
      },

      quantity: item.qty || 1,
    }));

    // =========================
    // STRIPE SESSION
    // =========================
    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],

        mode: "payment",

        line_items: lineItems,

        success_url:
          "https://shoplink-frontend-snowy.vercel.app/success",

        cancel_url:
          "https://shoplink-frontend-snowy.vercel.app",
      });

    // =========================
    // SAVE ORDERS
    // =========================
    for (const item of items) {
      await Order.create({
  productId: item._id,

  userId: req.user?.userId,

  userEmail:
    req.body.userEmail || "guest",

  paymentMethod: "stripe",

  stripeSessionId: session.id,

  paymentStatus: "pending",

  status: "processing",
});
    }

    // =========================
    // RETURN URL
    // =========================
    res.json({
      url: session.url,
    });

  } catch (err) {
    console.error("CHECKOUT ERROR:", err);

    res.status(500).json({
      error: "Checkout failed",
    });
  }
});

export default router;