import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    // NEW
    isSeller: {
      type: Boolean,
      default: false,
    },

    sellerInfo: {
      storeName: String,
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);