const express = require('express');
const router = express.Router();
const telemedicineController = require('../controllers/telemedicineController');

router.get('/appointments', telemedicineController.listAppointments);
router.post('/appointments', telemedicineController.createAppointment);
router.get('/appointments/:id', telemedicineController.getAppointment);
router.put('/appointments/:id', telemedicineController.updateAppointment);
router.delete('/appointments/:id', telemedicineController.deleteAppointment);

module.exports = router;
