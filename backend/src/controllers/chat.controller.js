const { askAI } = require("../services/aiService");

/**
 * POST /api/chat
 * body: { user_id, message, lang }
 */
const chatController = async (req, res) => {
  const { user_id, message, lang } = req.body;
  if (!message || !user_id) {
    return res.status(400).json({ error: "user_id and message are required" });
  }
  try {
    const aiText = await askAI(user_id, message, lang || "en");

    // quick action detection: suggest tool cards when keywords present
    const actions = [];
    const m = message.toLowerCase();
    if (m.includes("expense") || m.includes("spent") || m.includes("cost")) {
      actions.push({ tool: "expense", hint: "Track an expense" });
    }
    if (m.includes("business idea") || m.includes("start a business")) {
      actions.push({ tool: "idea", hint: "Generate business ideas" });
    }
    if (m.includes("sick") || m.includes("fever") || m.includes("pain")) {
      actions.push({ tool: "symptom", hint: "Symptom checker" });
    }

    res.json({ text: aiText, actions });
  } catch (err) {
    console.error("chatController err:", err?.message || err);
    res.status(500).json({ error: "AI service error" });
  }
};

module.exports = { chatController };
