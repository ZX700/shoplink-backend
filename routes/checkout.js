import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// =========================
// STRIPE CHECKOUT
// =========================
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    console.log(
      "CHECKOUT REQUEST:",
      req.body
    );

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
    // STRIPE LINE ITEMS
    // =========================
    const line_items = items.map(
      (item) => ({
        price_data: {
          currency: "usd",

          product_data: {
            name: item.name,
            description:
              item.description ||
              "ShopLink Product",
            images: item.image
              ? [item.image]
              : [],
          },

          unit_amount: Math.round(
            Number(item.price) * 100
          ),
        },

        quantity: item.qty || 1,
      })
    );

    // =========================
    // CREATE SESSION
    // =========================
    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: [
          "card",
        ],

        mode: "payment",

        line_items,

        success_url:
          "https://shoplink-frontend-snowy.vercel.app/success",

        cancel_url:
          "https://shoplink-frontend-snowy.vercel.app",
      });

    // =========================
    // SAVE ORDER
    // =========================
    for (const item of items) {
      await Order.create({
        productId: item._id,
        productName: item.name,
        amount: item.price,
        quantity: item.qty || 1,

        paymentMethod: "stripe",

        stripeSessionId:
          session.id,

        paymentStatus: "pending",
      });
    }

    // =========================
    // RETURN URL
    // =========================
    res.json({
      url: session.url,
    });

  } catch (err) {
    console.error(
      "CHECKOUT ERROR:",
      err
    );

    res.status(500).json({
      error: "Checkout failed",
    });
  }
});

export default router;