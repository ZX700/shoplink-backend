import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: raw body is required for Stripe verification
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // =========================
      // PAYMENT SUCCESS EVENT
      // =========================
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        console.log("✅ PAYMENT SUCCESS:", session.id);

        await Order.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            paymentStatus: "paid",
            status: "paid",
          }
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook processing error:", err);

      res.status(500).json({
        error: "Webhook processing failed",
      });
    }
  }
);

export default router;