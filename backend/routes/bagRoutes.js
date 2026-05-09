const express = require("express");
const admin = require("../firebaseAdmin");

const router = express.Router();
const BagItem = require("../models/BagItem");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

// ✅ GET bag items (ONLY current user)
router.get("/", auth, async (req, res) => {
  try {
    const items = await BagItem.find({ uid: req.uid }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Bag fetch failed", error: err.message });
  }
});

// ✅ POST add to bag (qty बढ़ेगी + price add होगी)
router.post("/", auth, async (req, res) => {
  try {
    const { productId, name, price, image, sellerId } = req.body;

    if (!productId || !name) {
      return res
        .status(400)
        .json({ message: "productId and name are required" });
    }

    // ✅ user wise unique
    const existing = await BagItem.findOne({ uid: req.uid, productId });

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
      existing.price = (existing.price || 0) + (price || 0);

      await existing.save();
      return res.json(existing);
    }

    const newItem = new BagItem({
      uid: req.uid,
      productId,
      name,
      image,
      sellerId: sellerId || null,
      qty: 1,
      price: price || 0,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    // ✅ IMPORTANT: backend terminal me real error दिखेगा
    console.log("ADD BAG ERROR:", err);

    res.status(500).json({ message: "Add to bag failed", error: err.message });
  }
});

// ✅ POST remove item quantity (-1)
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const existing = await BagItem.findOne({ uid: req.uid, productId });

    if (!existing) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ qty 1-1 कम
    existing.qty = (existing.qty || 1) - 1;

    // ✅ price bhi reduce (optional)
    if (price) {
      existing.price = Math.max(0, (existing.price || 0) - price);
    }

    // ✅ qty 0 -> item delete
    if (existing.qty <= 0) {
      await BagItem.deleteOne({ uid: req.uid, productId });
      return res.json({ message: "Item removed completely" });
    }

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: "Remove failed", error: err.message });
  }
});

// ✅ DELETE full item (optional: direct remove full item)
router.delete("/:productId", auth, async (req, res) => {
  try {
    await BagItem.deleteOne({ uid: req.uid, productId: req.params.productId });
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
