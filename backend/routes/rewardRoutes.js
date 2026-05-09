const router      = require("express").Router();
const RewardCode  = require("../models/RewardCode");

// GET — user ke unused reward codes
router.get("/my/:uid", async (req, res) => {
  try {
    const codes = await RewardCode.find({ uid: req.params.uid, used: false }).sort({ createdAt: -1 });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — code validate karo (use nahi karta, sirf check)
router.post("/validate", async (req, res) => {
  try {
    const { code, uid } = req.body;
    if (!code || !uid) return res.status(400).json({ valid: false, error: "code aur uid chahiye" });

    const reward = await RewardCode.findOne({ code: code.trim().toUpperCase(), uid, used: false });
    if (!reward) return res.status(400).json({ valid: false, error: "Code galat hai ya pehle use ho chuka hai" });

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
