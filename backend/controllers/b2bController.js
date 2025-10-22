const User = require('../models/User');
const Transaction = require('../models/Transaction');
const MarketplaceItem = require('../models/MarketplaceItem');
const InvestmentOpportunity = require('../models/InvestmentOpportunity');
const InsurancePolicy = require('../models/InsurancePolicy');
const Expense = require('../models/Expense');
const CommunityPost = require('../models/CommunityPost');
const Appointment = require('../models/Appointment');
const crypto = require('crypto');

// Utility: Encrypt sensitive data before saving to DB
function encryptField(value) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.SECRET_KEY?.slice(0, 32) || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Utility: Decrypt sensitive data from DB
function decryptField(encrypted) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.SECRET_KEY?.slice(0, 32) || crypto.randomBytes(32);
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  analytics: async function(req, res) {
    try {
      const userCount = await User.countDocuments();
      const transactionCount = await Transaction.countDocuments();
      const totalVolume = await Transaction.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      res.json({
        summary: `Users: ${userCount}, Transactions: ${transactionCount}, Total Volume: ${totalVolume[0]?.total || 0}`
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
    }
  },
  marketInsights: async function(req, res) {
    try {
      const itemCount = await MarketplaceItem.countDocuments();
      const investmentCount = await InvestmentOpportunity.countDocuments();
      res.json({
        trends: `Marketplace Items: ${itemCount}, Investment Opportunities: ${investmentCount}`
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch market insights', details: err.message });
    }
  },
  supplierIntel: async function(req, res) {
    try {
      const suppliers = await MarketplaceItem.distinct('createdBy');
      res.json({ info: `Suppliers: ${suppliers.join(', ')}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch supplier intelligence', details: err.message });
    }
  },
  customerIntel: async function(req, res) {
    try {
      const customers = await Transaction.distinct('userId');
      res.json({ info: `Customers: ${customers.join(', ')}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch customer intelligence', details: err.message });
    }
  },
  competitorIntel: async function(req, res) {
    try {
      const competitors = await InvestmentOpportunity.distinct('createdBy');
      res.json({ info: `Competitors: ${competitors.join(', ')}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch competitor intelligence', details: err.message });
    }
  },
  industryNews: async function(req, res) {
    try {
      const news = await CommunityPost.find().sort({ createdAt: -1 }).limit(5);
      res.json({ headlines: news.map(n => n.content) });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch industry news', details: err.message });
    }
  },
  aiOpportunities: async function(req, res) {
    try {
      const policies = await InsurancePolicy.find().limit(5);
      res.json({ suggestions: policies.map(p => p.policyName) });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch AI opportunities', details: err.message });
    }
  },
  generateReport: async function(req, res) {
    try {
      const userCount = await User.countDocuments();
      const transactionCount = await Transaction.countDocuments();
      const itemCount = await MarketplaceItem.countDocuments();
      res.json({
        success: true,
        report: {
          users: userCount,
          transactions: transactionCount,
          marketplaceItems: itemCount
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate report', details: err.message });
    }
  },
  configureAgent: async function(req, res) {
    const { config } = req.body;
    // Encrypt config before saving (simulate DB save)
    const encryptedConfig = encryptField(config);
    // Simulate compliance logging
    console.log('Agent config encrypted for privacy/compliance');
    res.json({ response: `Agent configured securely.`, encryptedConfig });
  },
  // Automated task flow example: Business-Money-Health synergy
  synergyFlow: async function(req, res) {
    try {
      // Example: Find users with recent business transactions and health appointments
      const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10);
      const userIds = recentTransactions.map(t => t.userId);
      const healthAppointments = await Appointment.find({ patientName: { $in: userIds } }).limit(10);
      res.json({
        synergy: {
          businessUsers: userIds,
          healthAppointments: healthAppointments
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch synergy flow', details: err.message });
    }
  },
  // Example: Encrypt sensitive fields in Expense before saving
  createExpense: async function(req, res) {
    try {
      const { user_id, amount, category } = req.body;
      // Encrypt category for privacy
      const encryptedCategory = encryptField(category);
      const expense = new Expense({ user_id, amount, category: encryptedCategory });
      await expense.save();
      res.json({ success: true, expense });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create expense', details: err.message });
    }
  },
  // Example: Decrypt sensitive fields in Expense when reading
  getExpenses: async function(req, res) {
    try {
      const expenses = await Expense.find();
      // Decrypt category for each expense
      const decryptedExpenses = expenses.map(e => ({
        ...e.toObject(),
        category: decryptField(e.category)
      }));
      res.json(decryptedExpenses);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
    }
  }
};
