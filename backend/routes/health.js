const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const healthController = require("../controllers/healthController");
const {
  symptomCheck,
  treatments,
  reminders,
  tracker,
  clinics,
  mentalSupport
} = healthController;

// Old route for backward compatibility
router.post("/symptom", symptomCheck);
// New routes matching frontend
router.post("/symptom-checker", symptomCheck);
router.post("/treatments", treatments);
router.post("/reminders", reminders);
router.post("/tracker", tracker);
router.post("/clinics", clinics);
router.post("/mental-support", mentalSupport);
router.post('/voice', upload.single('voice'), healthController.uploadVoice);
router.post('/image', upload.single('image'), healthController.uploadImage);

module.exports = router;
