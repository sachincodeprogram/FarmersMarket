const express = require("express");
const router = express.Router();
const StoreItem = require("../models/StoreItem");

// GET all
router.get("/", async (req, res) => {
  const items = await StoreItem.find();
  res.json(items);
});

// ADD
router.post("/add", async (req, res) => {
  await StoreItem.create(req.body);
  res.send("added");
});

// UPDATE KG
router.put("/:id", async (req, res) => {
  await StoreItem.findByIdAndUpdate(req.params.id, {
    kg: req.body.kg,
  });

  res.send("updated");
});

// DELETE
router.delete("/:id", async (req, res) => {
  await StoreItem.findByIdAndDelete(req.params.id);
  res.send("deleted");
});

module.exports = router;
