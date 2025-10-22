const { askAI } = require('../src/services/aiService');
const crypto = require('crypto');
const SECRET_KEY = process.env.SECRET_KEY?.slice(0, 32) || crypto.randomBytes(32);
function encryptField(value) {
  const algorithm = 'aes-256-cbc';
  const key = SECRET_KEY;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
function decryptField(encrypted) {
  const algorithm = 'aes-256-cbc';
  const key = SECRET_KEY;
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const track = async (req, res) => {
  const { userId, entry } = req.body;
  const prompt = `Track this transaction: ${entry}. Summarize and give advice.`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText });
};

const save = async (req, res) => {
  const { userId, query } = req.body;
  const encryptedQuery = encryptField(query);
  const prompt = `Give saving and investment advice for: ${decryptField(encryptedQuery)}`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText, encryptedQuery });
};

const funding = async (req, res) => {
  const { userId, query } = req.body;
  const prompt = `Find funding, loans, or grants for: ${query}`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText });
};

const plan = async (req, res) => {
  const { userId, query } = req.body;
  const prompt = `Plan personal finances for: ${query}`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText });
};

const predict = async (req, res) => {
  const { userId, query } = req.body;
  const prompt = `Predict cashflow for: ${query}`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText });
};

const habits = async (req, res) => {
  const { userId, query } = req.body;
  const prompt = `Teach good money habits for: ${query}`;
  const aiText = await askAI(userId, prompt);
  res.json({ result: aiText });
};

const uploadVoice = async (req, res) => {
  try {
    // File info: req.file.path, req.file.originalname
    // TODO: Process/save file, extract metadata if needed
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Voice upload failed', details: err.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    // File info: req.file.path, req.file.originalname
    // TODO: Process/save file, extract metadata if needed
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed', details: err.message });
  }
};

module.exports = { track, save, funding, plan, predict, habits, uploadVoice, uploadImage };
