const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  video: String,

  // ✅ FIX: sellerId String rakho — Firebase UID string hota hai, ObjectId nahi
  sellerId: {
    type: String,
    default: null,
  },

  location: String
});

module.exports = mongoose.model("Product", productSchema);