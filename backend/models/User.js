const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, unique: true },
    name: String,
    phone: String,
    address: String,

    profileDone: { type: Boolean, default: false },

    // NEW FIELDS
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    sellerCode: {
      type: String,
      default: null,
    },

    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);