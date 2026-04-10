const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// get all orders
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;