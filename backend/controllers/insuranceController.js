
const InsurancePolicy = require('../models/InsurancePolicy');

exports.listPolicies = async (req, res) => {
	try {
		const policies = await InsurancePolicy.find().sort({ createdAt: -1 });
		res.json({ policies });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch policies' });
	}
};

exports.createPolicy = async (req, res) => {
	try {
		const policy = new InsurancePolicy(req.body);
		await policy.save();
		res.json({ success: true, policy });
	} catch (err) {
		res.status(400).json({ error: 'Failed to create policy', details: err.message });
	}
};

exports.getPolicy = async (req, res) => {
	try {
		const policy = await InsurancePolicy.findById(req.params.id);
		if (!policy) return res.status(404).json({ error: 'Policy not found' });
		res.json({ policy });
	} catch (err) {
		res.status(400).json({ error: 'Failed to fetch policy' });
	}
};

exports.updatePolicy = async (req, res) => {
	try {
		const policy = await InsurancePolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!policy) return res.status(404).json({ error: 'Policy not found' });
		res.json({ success: true, policy });
	} catch (err) {
		res.status(400).json({ error: 'Failed to update policy' });
	}
};

exports.deletePolicy = async (req, res) => {
	try {
		await InsurancePolicy.findByIdAndDelete(req.params.id);
		res.json({ success: true, id: req.params.id });
	} catch (err) {
		res.status(400).json({ error: 'Failed to delete policy' });
	}
};
