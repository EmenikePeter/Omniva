const addExpense = async (req, res) => {
  const { user_id, amount, category } = req.body;
  // TODO: save to DB
  res.json({ status: "ok", expense: { user_id, amount, category } });
};

module.exports = { addExpense };
