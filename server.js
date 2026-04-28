import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ USER SCHEMA
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  sellerEmail: String,
});

const Product = mongoose.model("Product", productSchema);

// =========================
// 🔐 AUTH ROUTES
// =========================

// ✅ SIGNUP
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

// ✅ LOGIN
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

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// 🌱 SEED ROUTE (OPTIONAL)
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