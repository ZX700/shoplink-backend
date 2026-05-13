import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// =========================
// CREATE CHECKOUT SESSION
// =========================
router.post("/", async (req, res) => {
  try {
    const { product, userEmail } = req.body;

    console.log("🛒 CHECKOUT BODY:", req.body);

    // =========================
    // VALIDATION
    // =========================
    if (
      !product ||
      !product.name ||
      !product.price
    ) {
      return res.status(400).json({
        error: "Invalid product data",
      });
    }

    // FIX ID CONSISTENCY
    const productId =
      product.id || product._id || "unknown";

    // =========================
    // STRIPE SESSION
    // =========================
    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],

        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "usd",

              product_data: {
                name: product.name,

                description:
                  product.category || "Product",
              },

              unit_amount: Math.round(
                product.price * 100
              ),
            },

            quantity: 1,
          },
        ],

        success_url:
          "https://shoplink-frontend-snowy.vercel.app/success",

        cancel_url:
          `https://shoplink-frontend-snowy.vercel.app/product/${productId}`,
      });

    // =========================
    // CREATE PENDING ORDER
    // =========================
    await Order.create({
      userEmail: userEmail || "guest",

      items: [
        {
          productId,

          name: product.name,

          price: product.price,

          qty: 1,
        },
      ],

      total: product.price,

      stripeSessionId: session.id,

      paymentMethod: "stripe",

      paymentStatus: "pending",
    });

    // =========================
    // SEND STRIPE URL
    // =========================
    return res.json({
      url: session.url,
    });
  } catch (err) {
    console.error(
      "❌ CHECKOUT ERROR:",
      err
    );

    return res.status(500).json({
      error: "Checkout failed",
    });
  }
});

export default router;