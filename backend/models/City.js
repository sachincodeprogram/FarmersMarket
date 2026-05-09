const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
