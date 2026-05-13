import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// =========================
// STRIPE WEBHOOK
// =========================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(
        "❌ WEBHOOK SIGNATURE ERROR:",
        err.message
      );

      return res.status(400).send(
        `Webhook Error: ${err.message}`
      );
    }

    try {
      // =========================
      // PAYMENT SUCCESS EVENT
      // =========================
      if (
        event.type ===
        "checkout.session.completed"
      ) {
        const session = event.data.object;

        console.log(
          "💰 PAYMENT SUCCESS:",
          session.id
        );

        const updatedOrder =
          await Order.findOneAndUpdate(
            {
              stripeSessionId: session.id,
            },
            {
              paymentStatus: "paid",
            },
            {
              new: true,
            }
          );

        // =========================
        // DEBUG SAFETY CHECK
        // =========================
        if (!updatedOrder) {
          console.warn(
            "⚠️ No order found for session:",
            session.id
          );
        } else {
          console.log(
            "✅ ORDER UPDATED:",
            updatedOrder._id
          );
        }
      }

      return res.json({
        received: true,
      });
    } catch (err) {
      console.error(
        "❌ WEBHOOK PROCESSING ERROR:",
        err
      );

      return res.status(500).json({
        error: "Webhook processing failed",
      });
    }
  }
);

export default router;