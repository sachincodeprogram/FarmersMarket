const router = require("express").Router();
const Order = require("../models/Order");
const BagItem = require("../models/BagItem");
const User = require("../models/User");

// CREATE ORDER FROM BAG
router.post("/create", async (req, res) => {

  const { uid, advance } = req.body;

  const user = await User.findOne({ uid });
  const bags = await BagItem.find({ uid });

  if (bags.length === 0) {
    return res.status(400).json({ error: "Bag empty" });
  }

  const totalQty = bags.reduce((s, i) => s + (i.qty || 0), 0);
  const totalPrice = bags.reduce((s, i) => s + (i.price || 0), 0);

  await Order.create({
    uid,
    name: user.name,
    phone: user.phone,
    address: user.address,
    items: bags,
    totalQty,
    totalPrice,
    advancePaid: advance,
    location: user.location || "",   // ✅ NEW — user ki location order mein save ho
    status: "pending"
  });

  await BagItem.deleteMany({ uid });

  res.json({ success: true });
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


// ✅ NEW — VENDOR ORDERS (sirf us city ke pending orders)
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