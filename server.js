import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// =========================
// CORS (MUST BE FIRST)
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
// DB
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// =========================
// SCHEMAS
// =========================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
});

const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  productId: String,
  userEmail: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// =========================
// AUTH
// =========================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ user: { email } });
});
// =========================
// SIGNUP (ADD THIS)
// =========================
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

    res.json({
      message: "Signup successful",
      user: { email: newUser.email },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// PRODUCTS
// =========================
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// =========================
// ORDERS
// =========================
app.post("/api/orders", async (req, res) => {
  const { productId, userEmail, paymentMethod } = req.body;

  if (!userEmail) {
    return res.status(401).json({ error: "Login required" });
  }

  const order = await Order.create({
    productId,
    userEmail,
    paymentMethod,
  });

  res.json({ message: "Order placed", order });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});