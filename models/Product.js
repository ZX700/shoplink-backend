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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Product",
  productSchema
);