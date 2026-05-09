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

    // city_seller = apni city me bechta hai, thok_seller = wholesale mandi seller
    sellerType: {
      type: String,
      enum: ["city_seller", "thok_seller", null],
      default: null,
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