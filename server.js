import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// =========================
// CORS
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001", // ✅ ADDED because Next sometimes uses 3001
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
  .catch((err) => console.error("MongoDB error:", err));

// =========================
// SCHEMAS
// =========================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  productId: String,
  userEmail: String,
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

// =========================
// SIGNUP
// =========================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("SIGNUP BODY:", req.body);

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      email,
      password,
    });

    res.json({
      message: "Signup successful",
      user: {
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// LOGIN
// =========================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
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
    console.error("PRODUCT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// ORDERS
// =========================
app.post("/api/orders", async (req, res) => {
  try {
    const { productId, userEmail, paymentMethod } = req.body;

    console.log("ORDER BODY:", req.body);

    if (!productId || !userEmail) {
      return res.status(400).json({
        error: "Missing productId or userEmail",
      });
    }

    const order = await Order.create({
      productId,
      userEmail,
      paymentMethod,
    });

    res.json({
      message: "Order placed",
      order,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});