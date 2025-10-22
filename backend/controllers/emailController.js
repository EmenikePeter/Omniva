// Placeholder for real email OAuth and parsing logic
// In production, use Google/Outlook APIs and a secure OAuth flow

const startOAuth = (req, res) => {
  // Redirect user to email provider's OAuth page
  res.json({ url: 'https://accounts.google.com/o/oauth2/v2/auth?...' });
};

const bankPatterns = require('../config/bankPatterns');

const Transaction = require('../models/Transaction');

const fetchBankAlerts = async (req, res) => {
  // In production, fetch emails using user's OAuth token
  // Example: emails = await fetchUserEmails(userToken);
  // For demo, use mock email content from multiple banks
  const userId = req.query.userId || 'demo-user';
  const mockEmails = [
    {
      subject: 'GTBank Alert',
      body: 'Credit: NGN 5,000.00 from ABC Corp. Date: 20-Oct-2025. Bal: NGN 25,000.00',
    },
    {
      subject: 'Access Bank Notification',
      body: 'Debit: NGN 1,200.00 at SuperMart POS. Date: 18-Oct-2025. Bal: NGN 23,800.00',
    },
    {
      subject: 'Zenith Bank',
      body: 'Credit Alert: NGN 2,500.00 Desc: Freelance Payment Date: 17-Oct-2025.',
    },
    {
      subject: 'UBA',
      body: 'Debit Alert: NGN 800.00 Desc: ATM Withdrawal Date: 16-Oct-2025.',
    },
    {
      subject: 'HDFC',
      body: 'INR 10,000 credited. Desc: Salary Date: 15-Oct-2025.',
    },
    {
      subject: 'SBI',
      body: 'INR 2,000 debited. Desc: Shopping Date: 14-Oct-2025.',
    },
    {
      subject: 'Standard Bank',
      body: 'Deposit: ZAR 1,500.00 Desc: Payment Date: 2025/10/13.',
    },
  ];

  // Use bankPatterns config for parsing
  const alerts = [];
  for (const email of mockEmails) {
    let found = false;
    for (const pattern of bankPatterns) {
      if (new RegExp(pattern.name, 'i').test(email.subject)) {
        const parsed = pattern.parse(email.body);
        if (parsed) {
          found = true;
          alerts.push({ ...parsed, bank: pattern.name });
          // Store in DB
          try {
            await Transaction.create({ userId, bank: pattern.name, ...parsed });
          } catch (err) {}
        }
      }
    }
    if (!found) alerts.push({ bank: email.subject, error: 'Unrecognized format' });
  }
  res.json({ alerts });
};

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Gmail OAuth2 config
const gmailOAuth2Client = new OAuth2Client(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

const initiateGmailOAuth = (req, res) => {
  const url = gmailOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'email', 'profile'],
  });
  res.redirect(url);
};

const handleGmailOAuthCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await gmailOAuth2Client.getToken(code);
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'OAuth2 callback failed', details: err.message });
  }
};

const fetchGmailEmails = async (req, res) => {
  const tokens = req.query;
  gmailOAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: gmailOAuth2Client });
  try {
    const messages = await gmail.users.messages.list({ userId: 'me', maxResults: 20 });
    const emails = [];
    const alerts = [];
    for (const msg of messages.data.messages || []) {
      const msgData = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      // Extract subject and body
      let subject = '', body = '';
      const headers = msgData.data.payload.headers || [];
      for (const h of headers) {
        if (h.name.toLowerCase() === 'subject') subject = h.value;
      }
      if (msgData.data.payload.parts) {
        for (const part of msgData.data.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      } else if (msgData.data.payload.body && msgData.data.payload.body.data) {
        body = Buffer.from(msgData.data.payload.body.data, 'base64').toString('utf-8');
      }
      emails.push({ subject, body });
    }
    // Filter and parse bank alerts
    for (const email of emails) {
      let found = false;
      for (const pattern of bankPatterns) {
        if (new RegExp(pattern.name, 'i').test(email.subject)) {
          const parsed = pattern.parse(email.body);
          if (parsed) {
            found = true;
            alerts.push({ ...parsed, bank: pattern.name });
            // Store in DB
            try {
              await Transaction.create({ userId: req.query.userId || 'demo-user', bank: pattern.name, ...parsed });
            } catch (err) {}
          }
        }
      }
      if (!found) alerts.push({ bank: email.subject, error: 'Unrecognized format' });
    }
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch and parse Gmail emails', details: err.message });
  }
};

// Outlook OAuth2 config
const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const OUTLOOK_REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;

const initiateOutlookOAuth = (req, res) => {
  const params = new URLSearchParams({
    client_id: OUTLOOK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: OUTLOOK_REDIRECT_URI,
    response_mode: 'query',
    scope: 'openid profile offline_access User.Read Mail.Read',
    state: '12345',
  });
  res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`);
};

const handleOutlookOAuthCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
      client_id: OUTLOOK_CLIENT_ID,
      client_secret: OUTLOOK_CLIENT_SECRET,
      code,
      redirect_uri: OUTLOOK_REDIRECT_URI,
      grant_type: 'authorization_code',
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    res.json(tokenRes.data);
  } catch (err) {
    res.status(500).json({ error: 'OAuth2 callback failed', details: err.message });
  }
};

const fetchOutlookEmails = async (req, res) => {
  const accessToken = req.query.access_token;
  try {
    const mailRes = await axios.get('https://graph.microsoft.com/v1.0/me/messages?$top=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emails = mailRes.data.value.map(m => ({ subject: m.subject, body: m.body && m.body.content ? m.body.content : '' }));
    const alerts = [];
    for (const email of emails) {
      let found = false;
      for (const pattern of bankPatterns) {
        if (new RegExp(pattern.name, 'i').test(email.subject)) {
          const parsed = pattern.parse(email.body);
          if (parsed) {
            found = true;
            alerts.push({ ...parsed, bank: pattern.name });
            // Store in DB
            try {
              await Transaction.create({ userId: req.query.userId || 'demo-user', bank: pattern.name, ...parsed });
            } catch (err) {}
          }
        }
      }
      if (!found) alerts.push({ bank: email.subject, error: 'Unrecognized format' });
    }
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch and parse Outlook emails', details: err.message });
  }
};

const getTransactionAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId; // Use auth in production
    const transactions = await Transaction.find({ userId });
    let total = 0;
    const byCategory = {};
    const byMonth = {};
    transactions.forEach(tx => {
      total += tx.amount;
      if (!byCategory[tx.category]) byCategory[tx.category] = 0;
      byCategory[tx.category] += tx.amount;
      const month = tx.date ? tx.date.toISOString().slice(0,7) : 'unknown';
      if (!byMonth[month]) byMonth[month] = 0;
      byMonth[month] += tx.amount;
    });
    let advice = 'Keep tracking your spending.';
    if (total > 100000) advice = 'Consider budgeting, your spending is high.';
    res.json({ total, byCategory, byMonth, advice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze transactions', details: err.message });
  }
};

module.exports = {
  startOAuth,
  fetchBankAlerts,
  initiateGmailOAuth,
  handleGmailOAuthCallback,
  fetchGmailEmails,
  initiateOutlookOAuth,
  handleOutlookOAuthCallback,
  fetchOutlookEmails,
  getTransactionAnalytics,
};
