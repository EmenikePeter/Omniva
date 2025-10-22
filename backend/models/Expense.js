const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user_id: String,
  amount: Number,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
