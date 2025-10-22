const ChatMessage = require('../models/Chat.model');
const Expense = require('../models/Expense.model');

// GET /api/dashboard/stats?userId=xxx
async function getUserStats(req, res) {
  const userId = req.query.userId;
  console.log(`[Dashboard] Stats request for userId:`, userId);
  if (!userId) {
    console.warn('[Dashboard] Missing userId in stats request');
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    const chatCount = await ChatMessage.countDocuments({ userId });
    const expenseCount = await Expense.countDocuments({ userId });
    console.log(`[Dashboard] Stats for userId ${userId}: chats=${chatCount}, expenses=${expenseCount}`);
    res.json({
      chatCount,
      toolsUsed: expenseCount,
      businessActions: expenseCount // Replace with real business actions if available
    });
  } catch (err) {
    console.error('[Dashboard] Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
}

module.exports = { getUserStats };
