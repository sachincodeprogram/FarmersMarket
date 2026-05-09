const mongoose = require("mongoose");

const rewardCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  uid:  { type: String, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("RewardCode", rewardCodeSchema);
