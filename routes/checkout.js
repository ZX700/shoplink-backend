import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const { product, userEmail } =
        req.body;

      if (!product) {
        return res.status(400).json({
          error: "No product provided",
        });
      }

      const session =
        await stripe.checkout.sessions.create({
          payment_method_types: ["card"],

          line_items: [
            {
              price_data: {
                currency: "usd",

                product_data: {
                  name: product.name,
                },

                unit_amount:
                  Number(product.price) * 100,
              },

              quantity: 1,
            },
          ],

          mode: "payment",

          success_url:
            "https://shoplink-frontend.vercel.app/success",

          cancel_url:
            "https://shoplink-frontend.vercel.app/cancel",
        });

      // save order
      await Order.create({
        productId: product._id,

        userId: req.user.userId,

        userEmail:
          userEmail || "",

        stripeSessionId:
          session.id,

        paymentStatus: "pending",

        status: "processing",
      });

      res.json({
        url: session.url,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        error: "Checkout failed",
      });
    }
  }
);

export default router;