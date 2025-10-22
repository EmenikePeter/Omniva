const mongoose = require('mongoose');

const InsurancePolicySchema = new mongoose.Schema({
  policyName: { type: String, required: true },
  description: String,
  premium: Number,
  coverage: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InsurancePolicy', InsurancePolicySchema);
