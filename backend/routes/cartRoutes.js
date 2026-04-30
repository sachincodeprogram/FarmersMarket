const express = require("express");
const admin = require("../firebaseAdmin");
const BagItem = require("../models/BagItem");

const router = express.Router();

// ✅ Firebase Auth Middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

// ✅ GET cart items (uid wise)
router.get("/", auth, async (req, res) => {
  try {
    const items = await BagItem.find({ uid: req.uid }).sort({ createdAt: -1 });

    const totalQty = items.reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.price || 0), 0);

    res.json({
      uid: req.uid,
      items,
      totalQty,
      totalPrice,
    });
  } catch (err) {
    res.status(500).json({ message: "Cart fetch failed", error: err.message });
  }
});

// ✅ ADD product (qty +1)
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, name, price, image } = req.body;

    if (!productId || !name) {
      return res.status(400).json({ message: "productId and name are required" });
    }

    let item = await BagItem.findOne({ uid: req.uid, productId });

    if (item) {
      item.qty = (item.qty || 1) + 1;
      item.price = (item.price || 0) + (price || 0);
      await item.save();
      return res.json(item);
    }

    item = await BagItem.create({
      uid: req.uid,
      productId,
      name,
      image: image || "",
      qty: 1,
      price: price || 0,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Add failed", error: err.message });
  }
});

// ✅ REMOVE product qty (-1)
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    const item = await BagItem.findOne({ uid: req.uid, productId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty = (item.qty || 1) - 1;
    item.price = Math.max(0, (item.price || 0) - (price || 0));

    if (item.qty <= 0) {
      await BagItem.deleteOne({ uid: req.uid, productId });
      return res.json({ message: "Item removed completely" });
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Remove failed", error: err.message });
  }
});

// ✅ DELETE FULL ITEM directly
router.delete("/delete/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    await BagItem.deleteOne({ uid: req.uid, productId });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

// ✅ CLEAR FULL CART
router.delete("/clear", auth, async (req, res) => {
  try {
    await BagItem.deleteMany({ uid: req.uid });
    res.json({ message: "Cart cleared ✅" });
  } catch (err) {
    res.status(500).json({ message: "Clear failed", error: err.message });
  }
});

module.exports = router;
