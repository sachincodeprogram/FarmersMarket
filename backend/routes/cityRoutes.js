const router = require("express").Router();
const City   = require("../models/City");

const DEFAULT_CITIES = [
  "Delhi","Mumbai","Kolkata","Chennai","Bangalore",
  "Hyderabad","Pune","Ahmedabad","Jaipur","Lucknow","Noida","Gurgaon"
];

// GET all cities — seed defaults if empty
router.get("/", async (req, res) => {
  try {
    let cities = await City.find().sort({ createdAt: 1 });
    if (cities.length === 0) {
      await City.insertMany(DEFAULT_CITIES.map(name => ({ name })));
      cities = await City.find().sort({ createdAt: 1 });
    }
    res.json(cities.map(c => c.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — add new city
router.post("/", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "City name chahiye" });
    const city = await City.create({ name });
    res.json({ success: true, name: city.name });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Yeh city pehle se exist karti hai" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove city by name
router.delete("/:name", async (req, res) => {
  try {
    await City.deleteOne({ name: req.params.name });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
