const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: String,
  kg: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StoreItem", storeSchema);
