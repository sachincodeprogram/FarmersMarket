const mongoose = require("mongoose");

const bagItemSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true }, // ✅ user id

    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: String,

    qty: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ same user me same product unique
bagItemSchema.index({ uid: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("BagItem", bagItemSchema);
