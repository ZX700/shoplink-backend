import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  try {
    const { items, userEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "No items provided",
      });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.category || "",
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      success_url: "https://shoplink-frontend-snowy.vercel.app/success",
      cancel_url: "https://shoplink-frontend-snowy.vercel.app",
    });

    await Order.create({
      productId: items[0]?._id || "cart",
      userEmail: userEmail || "guest",
      paymentMethod: "stripe",
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    return res.json({
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