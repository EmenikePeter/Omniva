const express = require('express');
const { getUserStats } = require('../controllers/dashboard.controller');
const router = express.Router();

router.get('/stats', getUserStats);

module.exports = router;
