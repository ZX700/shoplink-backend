import mongoose from "mongoose";

const orderSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      products: {
        type: Array,
        default: [],
      },

      amount: Number,

      paymentStatus: {
        type: String,
        default: "paid",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Order",
  orderSchema
);