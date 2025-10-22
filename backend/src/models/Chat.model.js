const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // can store user._id or anon id
  role: { type: String, enum: ["user", "ai", "system"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
