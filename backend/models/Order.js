const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    uid: String,
    name: String,
    phone: String,
    address: String,
    items: Array,
    totalQty: Number,
    totalPrice: Number,
    advancePaid: Number,

    location: String,         // ✅ NEW — vendor filter ke liye

    // Thok Mandi sellers involved in this order (name + phone for contact)
    thokSellers: { type: Array, default: [] },

    status: {
      type: String,
      default: "pending"      // pending | delivered
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);