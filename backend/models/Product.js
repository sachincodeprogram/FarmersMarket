const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  video: String,

  // NEW
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  location: String
});

module.exports = mongoose.model("Product", productSchema);