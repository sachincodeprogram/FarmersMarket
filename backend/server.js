require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const bagRoutes = require("./routes/bagRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const storeRoute = require("./routes/store");

const app = express();

app.use(cors());
app.use(express.json());

// static videos
app.use("/videos", express.static(path.join(__dirname, "uploads/videos")));

// ✅ ROOT FIX (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend Live 🚀");
});

// ✅ API CHECK
app.get("/api", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/bag", bagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/store", storeRoute);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("👉 CONNECTED DATABASE: farmerApp=Cluster0");
  })
  .catch((err) => console.log("MongoDB Error:", err.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
