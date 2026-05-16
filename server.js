import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import checkoutRoute from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import sellerRoutes from "./routes/seller.js";
import uploadRoutes from "./routes/upload.js";
import webhookRoute from "./routes/webhook.js";

import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();

// =========================
// STRIPE WEBHOOK
// MUST COME BEFORE express.json()
// =========================
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoute
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

// NORMAL JSON ROUTES
app.use(express.json());

// =========================
// DEBUG
// =========================
console.log("🚀 Server starting...");
console.log("Mongo URI exists:", !!process.env.MONGO_URI);
console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("JWT exists:", !!process.env.JWT_SECRET);

// =========================
// DATABASE
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });

// =========================
// API ROUTES
// =========================
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/checkout", checkoutRoute);

app.use("/api/seller", sellerRoutes);

app.use("/api/upload", uploadRoutes);

// =========================
// TEST PROTECTED ROUTE
// =========================
app.get(
  "/api/protected",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected route works",
      user: req.user,
    });
  }
);

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("API running");
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    error: "Internal server error",
  });
});

// =========================
// SERVER START
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});