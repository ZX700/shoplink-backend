import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userEmail: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "stripe",
    },

    stripeSessionId: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },

    status: {
      type: String,
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIX OVERWRITE MODEL ERROR
export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);