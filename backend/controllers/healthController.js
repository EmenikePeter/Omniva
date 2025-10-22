const { askAI } = require("../src/services/aiService.js");
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

const symptomCheck = async (req, res) => {
  const { userId, symptoms, lang } = req.body;
  const encryptedSymptoms = encryptField(symptoms);
  const prompt = `User symptoms: ${decryptField(encryptedSymptoms)}. Give general health advice.`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText, encryptedSymptoms });
};

const treatments = async (req, res) => {
  const { userId, query, lang } = req.body;
  const prompt = `Suggest both herbal and modern treatments for: ${query}`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText });
};

const reminders = async (req, res) => {
  const { userId, reminder, lang } = req.body;
  const prompt = `Give advice or setup for reminders about: ${reminder}`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText });
};

const tracker = async (req, res) => {
  const { userId, log, lang } = req.body;
  const prompt = `Analyze and give feedback on this health log (stress/sleep/mood): ${log}`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText });
};

const clinics = async (req, res) => {
  const { userId, query, lang } = req.body;
  const prompt = `Find clinics or telemedicine options for: ${query}`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText });
};

const mentalSupport = async (req, res) => {
  const { userId, message, lang } = req.body;
  const prompt = `Provide mental health support or resources for: ${message}`;
  const aiText = await askAI(userId, prompt, lang || "en");
  res.json({ result: aiText });
};


const uploadVoice = async (req, res) => {
  try {
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Voice upload failed', details: err.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    res.json({ success: true, file: req.file });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed', details: err.message });
  }
};

module.exports = {
  symptomCheck,
  treatments,
  reminders,
  tracker,
  clinics,
  mentalSupport,
  uploadVoice,
  uploadImage
};
