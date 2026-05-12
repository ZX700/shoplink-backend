import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =========================
// MIDDLEWARE
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

app.use(express.json());

// =========================
// DEBUG (safe for prod)
// =========================
console.log("🚀 Server starting...");
console.log("Mongo URI exists:", !!process.env.MONGO_URI);
console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);

// =========================
// DATABASE CONNECTION
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// =========================
// MODELS
// =========================
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
});

const orderSchema = new mongoose.Schema({
  productId: String,
  userEmail: String,
  paymentMethod: String,
  paymentStatus: { type: String, default: "pending" },
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("API running");
});

// =========================
// AUTH (SIMPLE)
// =========================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ error: "User exists" });
    }

    const user = await User.create({ email, password });

    res.json({
      message: "Signup successful",
      user: { email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// PRODUCTS
// =========================
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// =========================
// STRIPE CHECKOUT (OPTIMIZED)
// =========================
app.post("/api/checkout", async (req, res) => {
  try {
    const { product, userEmail } = req.body;

    if (!product) {
      return res.status(400).json({ error: "Product missing" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.category,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],

      success_url:
        "https://shoplink-frontend-snowy.vercel.app/success",

      cancel_url:
        "https://shoplink-frontend-snowy.vercel.app/product/" +
        product.id,
    });

    // 🔥 create pending order BEFORE payment
    await Order.create({
      productId: product.id,
      userEmail: userEmail || "guest",
      paymentMethod: "stripe",
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    // ✅ CRITICAL LINE
    return res.json({ url: session.url });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =========================
// ORDERS (optional debug)
// =========================
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// =========================
// SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});