const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../utils/multer");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  res.json(await Product.find());
});

// GET PRODUCTS BY LOCATION
router.get("/location/:location", async (req, res) => {
  try {
    const products = await Product.find({
      location: req.params.location
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD PRODUCT
router.post(
  "/add",
  upload.fields([{ name: "image" }, { name: "video" }]),
  async (req, res) => {
    try {

      const name = req.body.name;
      const price = Number(req.body.price);
      const location = req.body.location;
      const sellerId = req.body.sellerId;

      if (!name || !price) {
        return res.status(400).json({ msg: "Missing fields" });
      }

      const image = req.files.image[0].path;
      const video = req.files.video[0].path;

      const product = await Product.create({
        name,
        price,
        image,
        video,
        sellerId,
        location
      });

      res.json(product);

    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Upload failed" });
    }
  }
);

// UPDATE PRICE
router.put("/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      price: req.body.price,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;