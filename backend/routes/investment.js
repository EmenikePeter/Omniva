const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.get('/opportunities', investmentController.listOpportunities);
router.post('/opportunities', investmentController.createOpportunity);
router.get('/opportunities/:id', investmentController.getOpportunity);
router.put('/opportunities/:id', investmentController.updateOpportunity);
router.delete('/opportunities/:id', investmentController.deleteOpportunity);

module.exports = router;
