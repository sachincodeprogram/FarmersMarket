const router      = require("express").Router();
const Order       = require("../models/Order");
const BagItem     = require("../models/BagItem");
const User        = require("../models/User");
const Product     = require("../models/Product");
const RewardCode  = require("../models/RewardCode");

// CREATE ORDER FROM BAG
router.post("/create", async (req, res) => {

  const { uid, advance, city, rewardCode } = req.body;

  const user = await User.findOne({ uid });
  const bags = await BagItem.find({ uid });

  if (bags.length === 0) {
    return res.status(400).json({ error: "Bag empty" });
  }

  // Thok Mandi sellers dhundo — order page mein contact show karne ke liye
  let thokSellers = [];
  try {
    const sellerIds = [...new Set(bags.map(b => b.sellerId).filter(Boolean))];
    if (sellerIds.length > 0) {
      const thokUsers = await User.find({ uid: { $in: sellerIds }, sellerType: "thok_seller" });
      thokSellers = thokUsers.map(s => ({
        sellerId: s.uid,
        name: s.name || "",
        phone: s.phone || ""
      }));
    }
  } catch (_) {}

  const totalQty   = bags.reduce((s, i) => s + (i.qty   || 0), 0);
  const totalPrice  = bags.reduce((s, i) => s + (i.price || 0), 0);

  // Reward code check — if valid, advance becomes 0
  let finalAdvance = advance || 0;
  if (rewardCode) {
    const reward = await RewardCode.findOne({
      code: rewardCode.trim().toUpperCase(),
      uid,
      used: false
    });
    if (reward) {
      await RewardCode.updateOne({ _id: reward._id }, { $set: { used: true } });
      finalAdvance = 0;
    }
  }

  await Order.create({
    uid,
    name:        user.name,
    phone:       user.phone,
    address:     user.address,
    items:       bags,
    totalQty,
    totalPrice,
    advancePaid: finalAdvance,
    location:    city || "",
    thokSellers,
    status:      "pending"
  });

  await BagItem.deleteMany({ uid });

  // Reward: har 3 orders ke baad, lekin sirf tab jab 3+ din guzar gaye hon pehle order se
  const orderCount = await Order.countDocuments({ uid });
  let newRewardCode = null;
  if (orderCount > 0 && orderCount % 3 === 0) {
    const firstOrder = await Order.findOne({ uid }).sort({ createdAt: 1 });
    const daysSinceFirst = firstOrder
      ? Math.floor((Date.now() - new Date(firstOrder.createdAt)) / (1000 * 60 * 60 * 24))
      : 0;
    if (daysSinceFirst >= 3) {
      newRewardCode = "KISAN" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await RewardCode.create({ code: newRewardCode, uid });
    }
  }

  res.json({ success: true, rewardCode: newRewardCode });
});


// ORDER AGAIN
router.post("/again", async (req, res) => {

  const { orderId } = req.body;

  const old = await Order.findById(orderId);
  if (!old) return res.status(404).json({ error: "Order not found" });

  await Order.create({
    uid: old.uid,
    name: old.name,
    phone: old.phone,
    address: old.address,
    items: old.items,
    totalQty: old.totalQty,
    totalPrice: old.totalPrice,
    advancePaid: Math.round(old.totalPrice * 0.25),
    location: old.location || "",    // ✅ NEW — same location carry forward
    status: "pending"
  });

  await Order.findByIdAndDelete(orderId);

  res.json({ success: true });
});


// USER ORDERS
router.get("/user/:uid", async (req, res) => {
  const orders = await Order.find({ uid: req.params.uid }).sort({ createdAt: -1 });
  res.json(orders);
});


// ADMIN PENDING (sab cities ke orders)
router.get("/admin", async (req, res) => {
  const orders = await Order.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json(orders);
});


// CITY SELLER — sirf us city ke pending orders
router.get("/vendor/:location", async (req, res) => {
  try {
    const orders = await Order.find({
      location: req.params.location,
      status: "pending"
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CITY SELLER — sirf us seller ke products wale orders (items.sellerId se match)
// ?status=pending (default) ya ?status=delivered
router.get("/city-seller/:uid", async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const orders = await Order.find({
      "items.sellerId": req.params.uid,
      status
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THOK MANDI SELLER — sirf woh orders jo us seller ke products contain karte hain
// ?status=pending (default) ya ?status=delivered
router.get("/thok-seller/:uid", async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const orders = await Order.find({
      "thokSellers.sellerId": req.params.uid,
      status
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// MARK DELIVERED
router.put("/deliver/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: "delivered" });
  res.json({ success: true });
});


// ADMIN SALES SUMMARY
router.get("/admin/summary", async (req, res) => {

  const orders = await Order.find();

  const totalSales = orders.reduce((a, b) => a + (b.totalPrice || 0), 0);

  res.json({
    totalOrders: orders.length,
    totalSales,
    today: orders.filter(o =>
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    ).length
  });
});

module.exports = router;