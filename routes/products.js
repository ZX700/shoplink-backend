import express from "express";

const router = express.Router();

// TEMP SAMPLE DATA (replace with MongoDB later if needed)
const products = [
  {
    id: 1,
    name: "Sample Product 1",
    price: 50,
    category: "General",
  },
  {
    id: 2,
    name: "Sample Product 2",
    price: 100,
    category: "General",
  },
];

// =========================
// GET PRODUCTS
// =========================
router.get("/", (req, res) => {
  res.json(products);
});

export default router;