import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    image: String,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
