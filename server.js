require("dotenv").config();
const sendOrderEmail = require("./utils/mailer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

// ---------------- CLOUDINARY CONFIG ----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// multer (memory upload)
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- MONGO ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ---------------- MODELS ----------------
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false },
  })
);

const Product = require("./models/Product");

// ---------------- AUTH MIDDLEWARE ----------------
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const admin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// ---------------- PRODUCTS ----------------

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// CREATE PRODUCT (WITH IMAGE UPLOAD)
app.post(
  "/api/products",
  auth,
  admin,
  upload.single("image"),
  async (req, res) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "shoplink" },
        async (error, result) => {
          if (error) return res.status(500).json(error);

          const product = await Product.create({
            name: req.body.name,
            price: req.body.price,
            image: result.secure_url,
          });

          res.json(product);
        }
      );

      stream.end(req.file.buffer);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// DELETE PRODUCT
app.delete("/api/products/:id", auth, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ---------------- START SERVER ----------------
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
const Order = require("./models/Order");

// CREATE ORDER (after checkout success)
app.post("/api/orders", auth, async (req, res) => {
  const { items, total } = req.body;

  const order = await Order.create({
    user: req.userId,
    items,
    total,
    status: "paid",
  });

  res.json(order);
});
app.get("/api/orders", auth, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json(orders);
});
app.patch("/api/orders/:id/status", auth, admin, async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(order);
});
app.post("/api/orders", auth, async (req, res) => {
  const { items, total } = req.body;

  const order = await Order.create({
    user: req.userId,
    items,
    total,
    status: "paid",
  });

  // Get user email
  const user = await User.findById(req.userId);

  // Send email
  try {
    await sendOrderEmail(user.email, order);
  } catch (err) {
    console.log("Email failed:", err.message);
  }

  res.json(order);
});
app.patch("/api/orders/:id/status", auth, admin, async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  const user = await User.findById(order.user);

  try {
    await sendOrderEmail(user.email, order);
  } catch (err) {
    console.log(err.message);
  }

  res.json(order);
});