const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'omniva_secret';

// Register new user
const register = async (req, res) => {
  console.log("[REGISTER] Incoming request:", req.body);
  const { name, email, password, country, language } = req.body;
  if (!email || !password) {
    console.log("[REGISTER] Missing email or password");
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("[REGISTER] Email already registered:", email);
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, country, language });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log("[REGISTER] User created:", user);
    res.json({ user: { id: user._id, name, email, country, language }, token });
  } catch (err) {
    console.error("[REGISTER] Error:", err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  console.log("[LOGIN] Incoming request:", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("[LOGIN] Missing email or password");
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[LOGIN] User not found:", email);
      return res.status(404).json({ error: 'User not found' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("[LOGIN] Invalid password for:", email);
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log("[LOGIN] User logged in:", user);
    res.json({ user: { id: user._id, name: user.name, email, country: user.country, language: user.language }, token });
  } catch (err) {
    console.error("[LOGIN] Error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { register, login };
