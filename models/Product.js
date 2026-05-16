import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userName: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
    },

    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    senderName: {
      type: String,
      default: "",
    },

    text: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    // =========================
    // PRODUCT INFO
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // MULTIPLE IMAGES
    gallery: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 1,
    },

    sold: {
      type: Number,
      default: 0,
    },

    // =========================
    // SELLER INFO
    // =========================
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sellerName: {
      type: String,
      default: "",
    },

    sellerEmail: {
      type: String,
      default: "",
    },

    sellerPhone: {
      type: String,
      default: "",
    },

    whatsappNumber: {
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

    // =========================
    // PRODUCT STATUS
    // =========================
    isScamReported: {
      type: Boolean,
      default: false,
    },

    scamReports: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // REVIEWS
    // =========================
    reviews: {
      type: [reviewSchema],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    // =========================
    // COMMENTS / CHAT
    // =========================
    comments: {
      type: [messageSchema],
      default: [],
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