const express = require("express");
const router = express.Router();
const User = require("../models/User.model");

// Simple create/get endpoints for alpha
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    console.error("create user err:", err?.message || err);
    res.status(500).json({ error: "User creation failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json(u);
  } catch (err) {
    console.error("get user err:", err?.message || err);
    res.status(500).json({ error: "User fetch failed" });
  }
});

module.exports = router;
