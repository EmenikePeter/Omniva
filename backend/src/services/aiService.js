const { CohereClientV2 } = require("cohere-ai");
const ChatMessage = require("../models/Chat.model.js");

const COHERE_KEY = process.env.CO_API_KEY;
if (!COHERE_KEY) {
  console.warn("COHERE_API_KEY not set. AI calls will fail until provided.");
}
const cohere = new CohereClientV2({ token: COHERE_KEY });

/**
 * Build a safe system prompt for Omniva.
 * Adjust content to your needs.
 */
function buildSystemPrompt(lang = "en") {
  // Keep prompt short & actionable. Expand later by locale.
  return `
You are Omniva, a friendly, helpful AI assistant that advises users on Business, Money and Health.
Respond in ${lang}. Be clear, concise and actionable. Ask clarifying questions when needed.
If user asks for medical or financial advice that could be risky, include safe disclaimers and suggest professional help.
Suggest in-app tools when useful (expense tracker, business idea generator, symptom checker).
`;
}

/**
 * askAI - sends user message + recent context to Cohere and returns text
 * @param {String} userId
 * @param {String} message
 * @param {String} lang
 */
async function askAI(userId, message, lang = "en") {
  try {
    // Save user message to chat history (lightweight)
    await ChatMessage.create({ userId, role: "user", text: message });

    // Build system prompt for chat
    const systemPrompt = buildSystemPrompt(lang);

    // Use Cohere Chat API (v2)
    const response = await cohere.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      model: "command-a-03-2025", // latest supported model
      maxTokens: 300,
      responseFormat: { type: "json_object" }
    });

    console.log("Cohere raw response:", response);

  // Try to extract the AI text from possible fields
    let aiText =
      (response.message &&
        Array.isArray(response.message.content) &&
        response.message.content[0]?.text) ||
      response.text ||
      response.output ||
      response.result ||
      response.reply ||
      "Sorry, I couldn't form an answer.";

    // Save AI reply
    await ChatMessage.create({ userId, role: "ai", text: aiText });

    return aiText;
  } catch (err) {
    console.error("aiService.askAI error:", err?.message || err);
    throw err;
  }
}

module.exports = { askAI };
