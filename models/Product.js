import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // =========================
    // PRODUCT INFO
    // =========================
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // FIXED
    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    // =========================
    // SELLER INFO
    // =========================
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sellerName: {
      type: String,
      default: "",
    },

    storeName: {
      type: String,
      default: "",
    },

    bankName: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    accountName: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    // =========================
    // REVIEWS
    // =========================
    reviews: [
      {
        user: String,
        text: String,
        rating: Number,
      },
    ],

    // =========================
    // STOCK
    // =========================
    stock: {
      type: Number,
      default: 1,
    },

    // =========================
    // PRODUCT STATUS
    // =========================
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.Product ||
  mongoose.model(
    "Product",
    productSchema
  );