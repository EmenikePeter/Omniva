const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// ...existing code...
router.post('/voice', upload.single('voice'), businessController.uploadVoice);
router.post('/image', upload.single('image'), businessController.uploadImage);

router.post("/idea", businessController.businessIdea);

module.exports = router;
