import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =========================
// STRIPE CHECKOUT SESSION
// =========================
router.post("/", async (req, res) => {
  try {
    const { product, userEmail } = req.body;

    console.log("CHECKOUT REQUEST:", req.body);

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!product || !product.name || !product.price) {
      return res.status(400).json({
        error: "Invalid product data",
      });
    }

    // -------------------------
    // CREATE STRIPE SESSION
    // -------------------------
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name, // IMPORTANT (fixes “Unnamed item”)
              description: product.category || "Product purchase",
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],

      success_url:
        "https://shoplink-frontend-snowy.vercel.app/success",

      cancel_url:
        "https://shoplink-frontend-snowy.vercel.app",

    });

    // -------------------------
    // SAVE PENDING ORDER
    // -------------------------
    await Order.create({
      productId: product._id || "cart",
      userEmail: userEmail || "guest",
      paymentMethod: "stripe",
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    // -------------------------
    // RETURN STRIPE URL
    // -------------------------
    return res.json({
      url: session.url,
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);

    return res.status(500).json({
      error: "Checkout failed",
    });
  }
});

export default router;