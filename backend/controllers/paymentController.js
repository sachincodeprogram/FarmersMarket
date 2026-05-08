const Razorpay = require("razorpay");
const crypto   = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── CREATE ORDER: 5% advance + Razorpay charges (~2%)
const createOrder = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ msg: "Sahi price bhejo" });
    }

    const advance  = Math.round(price * 0.05);          // 5% of total
    const fee      = Math.ceil(advance * 0.02);          // ~2% Razorpay charges
    const total    = advance + fee;                      // total to charge now

    const order = await razorpay.orders.create({
      amount:   total * 100,   // paise mein
      currency: "INR",
    });

    res.json({
      orderId: order.id,
      advance,
      fee,
      total,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ msg: "Razorpay order create nahi hua", error: err.message });
  }
};

// ── VERIFY PAYMENT: signature check
const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expected === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, msg: "Invalid signature" });
  }
};

module.exports = { createOrder, verifyPayment };