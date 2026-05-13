import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import checkoutRoutes from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import webhookRoutes from "./routes/webhook.js";

import { authMiddleware } from "./middleware/middleware.js";

dotenv.config();

const app = express();

// =========================
// STRIPE WEBHOOK (RAW BODY MUST COME FIRST)
// =========================
app.use(
  "/api/stripe/webhook",
  webhookRoutes
);

// =========================
// CORE MIDDLEWARE
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://shoplink-frontend-snowy.vercel.app",
    ],
    credentials: true,
  })
);

// IMPORTANT: JSON AFTER WEBHOOK
app.use(express.json());

// =========================
// DEBUG
// =========================
console.log("🚀 Server starting...");
console.log("Mongo URI exists:", !!process.env.MONGO_URI);
console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);

// =========================
// DATABASE
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// =========================
// ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

// =========================
// PROTECTED TEST ROUTE (OPTIONAL)
// =========================
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("API running");
});

// =========================
// SERVER START
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});