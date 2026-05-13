import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // =========================
    // USER EMAIL
    // =========================
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // PRODUCTS
    // =========================
    items: [
      {
        productId: String,

        name: String,

        price: Number,

        qty: {
          type: Number,
          default: 1,
        },
      },
    ],

    // =========================
    // TOTAL
    // =========================
    total: {
      type: Number,
      required: true,
      default: 0,
    },

    // =========================
    // STRIPE
    // =========================
    stripeSessionId: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      default: "stripe",
    },

    // =========================
    // STATUS
    // =========================
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "processing",
        "shipped",
        "delivered",
      ],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;