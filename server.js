import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from "./routes/orders.js";
app.use("/api/orders", orderRoutes);

const app = express();

// =========================
// ✅ MIDDLEWARE
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://shoplink-frontend-ashen.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// =========================
// ✅ MONGODB CONNECTION
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// =========================
// ✅ SCHEMAS
// =========================

// USER
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// PRODUCT
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  sellerEmail: String,
});

const Product = mongoose.model("Product", productSchema);

// ORDER ✅ (THIS WAS MISSING BEFORE)
const orderSchema = new mongoose.Schema({
  productId: String,
  paymentMethod: String,
  userEmail: String,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

// =========================
// 🔐 AUTH ROUTES
// =========================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

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
// 📦 PRODUCT ROUTES
// =========================

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// 🛒 ORDER ROUTE (FIXED)
// =========================

app.post("/api/orders", async (req, res) => {
  try {
    const { productId, paymentMethod, userEmail } = req.body;

    if (!productId || !userEmail) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const order = new Order({
      productId,
      paymentMethod,
      userEmail,
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// 🌱 SEED DATA
// =========================

app.get("/api/seed", async (req, res) => {
  try {
    await Product.deleteMany();

    await Product.insertMany([
      {
        id: 1,
        name: "Red Sneakers",
        price: 59.99,
        category: "Shoes",
        sellerEmail: "seller1@example.com",
      },
      {
        id: 2,
        name: "Blue T-Shirt",
        price: 29.99,
        category: "Clothing",
        sellerEmail: "seller2@example.com",
      },
    ]);

    res.json({ message: "Database seeded" });
  } catch (err) {
    res.status(500).json({ error: "Seed failed" });
  }
});

// =========================
// 🚀 START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});