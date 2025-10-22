const Expense = require("../models/Expense.model");
const { askAI } = require("../services/aiService");

/**
 * POST /api/tools/expense
 * body: { user_id, amount, category, note }
 */
const addExpenseController = async (req, res) => {
  const { user_id, amount, category = "General", note } = req.body;
  if (!user_id || amount == null) return res.status(400).json({ error: "user_id and amount required" });

  try {
    const exp = await Expense.create({ userId: user_id, amount, category, note });
    res.json({ status: "ok", expense: exp });
  } catch (err) {
    console.error("addExpenseController err:", err?.message || err);
    res.status(500).json({ error: "Could not save expense" });
  }
};

/**
 * POST /api/tools/idea
 * body: { user_id, sector?, lang? }
 * returns a generated business idea
 */
const businessIdeaController = async (req, res) => {
  const { user_id, sector = "general", lang = "en" } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    const prompt = `Provide 3 simple, low-cost business ideas for someone in ${sector}. Keep it practical and actionable.`;
    const idea = await askAI(user_id, prompt, lang);
    res.json({ idea });
  } catch (err) {
    console.error("businessIdeaController err:", err?.message || err);
    res.status(500).json({ error: "AI error generating ideas" });
  }
};

/**
 * POST /api/tools/symptom
 * body: { user_id, symptoms, lang? }
 * returns general advice (not medical diagnosis)
 */
const symptomController = async (req, res) => {
  const { user_id, symptoms, lang = "en" } = req.body;
  if (!user_id || !symptoms) return res.status(400).json({ error: "user_id and symptoms required" });

  try {
    const prompt = `User reports: ${symptoms}. List 3 possible common causes and safe next steps. Include red flag signs that require immediate medical attention. Keep it brief and in ${lang}.`;
    const advice = await askAI(user_id, prompt, lang);
    res.json({ advice });
  } catch (err) {
    console.error("symptomController err:", err?.message || err);
    res.status(500).json({ error: "AI error for symptom check" });
  }
};

module.exports = { addExpenseController, businessIdeaController, symptomController };
