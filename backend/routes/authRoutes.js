const express = require("express");
const axios = require("axios");
const UAParser = require("ua-parser-js");
const admin = require("../firebaseAdmin");
const LoginLog = require("../models/LoginLog");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    // ✅ verify firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const userId = decoded.uid;
    const name = decoded.name || "";
    const email = decoded.email || "";
    const provider =
      decoded.firebase?.sign_in_provider || decoded.sign_in_provider || "";

    // ✅ get IP
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;

    // ✅ User-Agent parse
    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    const device = ua.device.model
      ? `${ua.device.vendor || ""} ${ua.device.model}`.trim()
      : "Desktop";
    const os = `${ua.os.name || ""} ${ua.os.version || ""}`.trim();
    const browser = `${ua.browser.name || ""} ${ua.browser.version || ""}`.trim();

    // ✅ location by IP
    let city = "",
      region = "",
      country = "";

    try {
      const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
      city = geo.data?.city || "";
      region = geo.data?.region || "";
      country = geo.data?.country_name || "";
    } catch (err) {
      console.log("Geo error:", err.message);
    }

    // ✅ Save login log
    await LoginLog.create({
      userId,
      name,
      email,
      provider,
      ip,
      city,
      region,
      country,
      device,
      os,
      browser,
      userAgent,
      loginTime: new Date(),
    });

    res.json({
      message: "Login tracked",
      user: { userId, name, email, provider },
    });
  } catch (err) {
    console.log("Login track error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
