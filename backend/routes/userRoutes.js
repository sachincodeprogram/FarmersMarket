const router = require("express").Router();
const User = require("../models/User");

// SAVE / UPDATE PROFILE
router.post("/profile", async (req, res) => {
  try {
    await User.updateOne(
      { uid: req.body.uid },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address,
          profileDone: true
        }
      },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CHECK PROFILE COMPLETE + ROLE
router.get("/check/:uid", async (req, res) => {
  try {

    const user = await User.findOne({ uid: req.params.uid });

    if (user && user.profileDone) {
      res.json({
        complete: true,
        role: user.role || "user",
        location: user.location || "",
        sellerType: user.sellerType || null
      });
    } else {
      res.json({
        complete: false,
        role: "user",
        location: ""
      });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET ALL USERS (admin ke liye)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ NEW — ADMIN: Kisi user ko Seller banao
router.post("/assign-seller", async (req, res) => {
  try {

    const { uid, location, sellerType } = req.body;

    if (!uid || !location) {
      return res.status(400).json({ error: "uid aur location dono chahiye" });
    }

    const validTypes = ["city_seller", "thok_seller"];
    const type = validTypes.includes(sellerType) ? sellerType : "city_seller";

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ error: "User nahi mila" });
    }

    await User.updateOne(
      { uid },
      {
        $set: {
          role: "seller",
          location: location.trim(),
          sellerType: type
        }
      }
    );

    const typeLabel = type === "thok_seller" ? "Thok Mandi Seller" : "City Seller";
    res.json({ success: true, message: `${user.name} ab ${typeLabel} hai — ${location}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ NEW — ADMIN: Seller ko wapas User banao
router.post("/remove-seller", async (req, res) => {
  try {

    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "uid chahiye" });
    }

    await User.updateOne(
      { uid },
      {
        $set: {
          role: "user",
          location: "",
          sellerType: null
        }
      }
    );

    res.json({ success: true, message: "Seller role remove ho gaya" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;