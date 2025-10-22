
const Appointment = require('../models/Appointment');

exports.listAppointments = async (req, res) => {
	try {
		const appointments = await Appointment.find().sort({ createdAt: -1 });
		res.json({ appointments });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch appointments' });
	}
};

exports.createAppointment = async (req, res) => {
	try {
		const appointment = new Appointment(req.body);
		await appointment.save();
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(400).json({ error: 'Failed to create appointment', details: err.message });
	}
};

exports.getAppointment = async (req, res) => {
	try {
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
		res.json({ appointment });
	} catch (err) {
		res.status(400).json({ error: 'Failed to fetch appointment' });
	}
};

exports.updateAppointment = async (req, res) => {
	try {
		const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(400).json({ error: 'Failed to update appointment' });
	}
};

exports.deleteAppointment = async (req, res) => {
	try {
		await Appointment.findByIdAndDelete(req.params.id);
		res.json({ success: true, id: req.params.id });
	} catch (err) {
		res.status(400).json({ error: 'Failed to delete appointment' });
	}
};
