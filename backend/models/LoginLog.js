const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    email: String,
    provider: String,

    ip: String,
    city: String,
    region: String,
    country: String,

    device: String,
    os: String,
    browser: String,
    userAgent: String,

    loginTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginLog", loginLogSchema);
