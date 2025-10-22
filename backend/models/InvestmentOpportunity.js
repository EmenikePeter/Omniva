const mongoose = require('mongoose');

const InvestmentOpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: Number,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvestmentOpportunity', InvestmentOpportunitySchema);
