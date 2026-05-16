import express from "express";
import Stripe from "stripe";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// =========================
// STRIPE CHECKOUT SESSION
// =========================
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const { items } = req.body;

      console.log(
        "🛒 CHECKOUT REQUEST:",
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
          error: "Cart is empty",
        });
      }

      // =========================
      // BUILD STRIPE LINE ITEMS
      // =========================
      const lineItems = items.map((item) => ({
        price_data: {
          currency: "usd",

          product_data: {
            name: item.name,

            description:
              item.description ||
              item.category ||
              "Product purchase",

            images: item.image
              ? [item.image]
              : [],
          },

          unit_amount: Math.round(
            Number(item.price) * 100
          ),
        },

        quantity: item.qty || 1,
      }));

      // =========================
      // CALCULATE TOTAL
      // =========================
      const totalAmount = items.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            (item.qty || 1),
        0
      );

      // =========================
      // CREATE STRIPE SESSION
      // =========================
      const session =
        await stripe.checkout.sessions.create({
          payment_method_types: [
            "card",
          ],

          mode: "payment",

          line_items: lineItems,

          success_url:
            "https://shoplink-frontend-snowy.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",

          cancel_url:
            "https://shoplink-frontend-snowy.vercel.app",

          customer_email:
            req.user.email,

          metadata: {
            buyerId:
              req.user.userId,
          },
        });

      // =========================
      // SAVE ORDER
      // =========================
      const order =
        await Order.create({
          buyerId: req.user.userId,

          buyerEmail:
            req.user.email,

          products: items.map(
            (item) => ({
              productId:
                item._id,

              name: item.name,

              image: item.image,

              price: item.price,

              qty:
                item.qty || 1,

              sellerId:
                item.sellerId,

              sellerName:
                item.sellerName,
            })
          ),

          totalAmount,

          stripeSessionId:
            session.id,

          paymentStatus:
            "pending",

          deliveryStatus:
            "processing",

          scamReported: false,
        });

      // =========================
      // UPDATE PRODUCT SALES
      // =========================
      for (const item of items) {
        if (item._id) {
          await Product.findByIdAndUpdate(
            item._id,
            {
              $inc: {
                salesCount:
                  item.qty || 1,
              },
            }
          );
        }
      }

      // =========================
      // RETURN CHECKOUT URL
      // =========================
      return res.status(200).json({
        success: true,

        url: session.url,

        orderId: order._id,
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
  }
);

export default router;