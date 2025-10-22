const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

router.get('/policies', insuranceController.listPolicies);
router.post('/policies', insuranceController.createPolicy);
router.get('/policies/:id', insuranceController.getPolicy);
router.put('/policies/:id', insuranceController.updatePolicy);
router.delete('/policies/:id', insuranceController.deletePolicy);

module.exports = router;
