const { askAI } = require("../src/services/aiService.js");

const businessIdea = async (req, res) => {
  const { user_id, lang } = req.body;
  // Call AI for business idea
  const prompt = "Suggest a new business idea for my country and skills.";
  const aiText = await askAI(user_id, prompt, lang || "en");
  res.json({ idea: aiText });
};

const uploadVoice = async (req, res) => {
  try {
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Voice upload failed', details: err.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed', details: err.message });
  }
};

module.exports = { businessIdea, uploadVoice, uploadImage };
