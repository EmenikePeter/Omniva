const express = require('express');
const router = express.Router();
const moneyController = require('../controllers/moneyController');
const {
  track,
  save,
  funding,
  plan,
  predict,
  habits
} = moneyController;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/track', track);
router.post('/save', save);
router.post('/funding', funding);
router.post('/plan', plan);
router.post('/predict', predict);
router.post('/habits', habits);
router.post('/voice', upload.single('voice'), moneyController.uploadVoice);
router.post('/image', upload.single('image'), moneyController.uploadImage);

module.exports = router;
