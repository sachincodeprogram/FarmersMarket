const express = require("express");
const router  = express.Router();
const Product = require("../models/Product");
const User    = require("../models/User");
const upload  = require("../utils/multer");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  res.json(await Product.find());
});

// GET PRODUCTS BY LOCATION — ?type=city_seller|thok_seller filter optional
// Sellers are looked up first (by User.location + User.sellerType) so home page
// always reflects exactly what admin set in Manage Sellers.
router.get("/location/:location", async (req, res) => {
  try {
    const { type } = req.query;
    const city = req.params.location;

    // Step 1: find active sellers in this city, filtered by type
    const sellerFilter = { role: "seller", location: city };
    if (type === "thok_seller")  sellerFilter.sellerType = "thok_seller";
    if (type === "city_seller")  sellerFilter.sellerType = { $ne: "thok_seller" };

    const sellers = await User.find(sellerFilter);
    if (sellers.length === 0) return res.json([]);

    const sellerMap = {};
    sellers.forEach(s => {
      sellerMap[s.uid] = {
        name:       s.name  || "Kisan",
        phone:      s.phone || "",
        sellerType: s.sellerType || "city_seller",
      };
    });

    // Step 2: fetch all products belonging to those sellers
    const sellerIds = sellers.map(s => s.uid);
    const products  = await Product.find({ sellerId: { $in: sellerIds } });

    const enriched = products.map(p => ({
      ...p.toObject(),
      sellerName:  sellerMap[p.sellerId]?.name       || "Kisan",
      sellerPhone: sellerMap[p.sellerId]?.phone      || "",
      sellerType:  sellerMap[p.sellerId]?.sellerType || "city_seller",
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PRODUCTS BY SELLER UID
router.get("/seller/:uid", async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.uid });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD PRODUCT — seller & admin dono use karte hain
router.post(
  "/add",
  upload.fields([{ name: "image" }, { name: "video" }]),
  async (req, res) => {
    try {
      const name     = req.body.name;
      const price    = Number(req.body.price);
      const location = req.body.location || "";
      const sellerId = req.body.sellerId || null;

      if (!name || !price) {
        return res.status(400).json({ msg: "name aur price zaroori hain" });
      }

      if (!req.files || !req.files.image || !req.files.video) {
        return res.status(400).json({ msg: "image aur video dono upload karo" });
      }

      const image = req.files.image[0].path;
      const video = req.files.video[0].path;

      const product = await Product.create({ name, price, image, video, sellerId, location });
      res.json(product);
    } catch (err) {
      console.log("Product add error:", err);
      res.status(500).json({ msg: "Upload failed", error: err.message });
    }
  }
);

// UPDATE NAME + PRICE
router.put("/:id", async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.name  !== undefined) updateFields.name  = req.body.name;
    if (req.body.price !== undefined) updateFields.price = Number(req.body.price);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ msg: "Kuch update karne ke liye bhejo" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT
//e
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;