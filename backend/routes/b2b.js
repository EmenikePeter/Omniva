const express = require('express');
const router = express.Router();
const b2bController = require('../controllers/b2bController');

router.get('/analytics', b2bController.analytics);
router.get('/market-insights', b2bController.marketInsights);
router.get('/supplier-intel', b2bController.supplierIntel);
router.get('/customer-intel', b2bController.customerIntel);
router.get('/competitor-intel', b2bController.competitorIntel);
router.get('/industry-news', b2bController.industryNews);
router.get('/ai-opportunities', b2bController.aiOpportunities);
router.post('/report', b2bController.generateReport);
router.post('/agent', b2bController.configureAgent);
router.get('/synergy-flow', b2bController.synergyFlow);

module.exports = router;
