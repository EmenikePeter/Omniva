const { askAI } = require("../src/services/aiService");

const chatHandler = async (req, res) => {
  const { user_id, message, lang } = req.body;
  console.log("[chatHandler] Incoming request:", { user_id, message, lang });

  // Call AI service for response and actions
  try {
  const aiText = await askAI(user_id, message, lang || "en");
    console.log("[chatHandler] AI result:", aiText);
    res.json({ text: aiText, actions: [] });
  } catch (err) {
    console.error("[chatHandler] Error:", err, err?.response?.data);
    res.status(500).json({ error: "AI service error", details: err.message, stack: err.stack });
  }
};

module.exports = { chatHandler };
