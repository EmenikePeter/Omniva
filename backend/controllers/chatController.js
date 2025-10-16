const chatHandler = async (req, res) => {
  const { user_id, message, lang } = req.body;

  // TODO: connect AI service here (OpenAI / LLM)
  const responseText = `Echo: "${message}"`;

  // placeholder tool suggestions
  const actions = [];
  if(message.toLowerCase().includes("expense")){
    actions.push({ tool: "expense_add", payload: { amount: 0 } });
  }

  res.json({ text: responseText, actions });
};

module.exports = { chatHandler };
