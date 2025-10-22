
const InvestmentOpportunity = require('../models/InvestmentOpportunity');

exports.listOpportunities = async (req, res) => {
	try {
		const opportunities = await InvestmentOpportunity.find().sort({ createdAt: -1 });
		res.json({ opportunities });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch opportunities' });
	}
};

exports.createOpportunity = async (req, res) => {
	try {
		const opportunity = new InvestmentOpportunity(req.body);
		await opportunity.save();
		res.json({ success: true, opportunity });
	} catch (err) {
		res.status(400).json({ error: 'Failed to create opportunity', details: err.message });
	}
};

exports.getOpportunity = async (req, res) => {
	try {
		const opportunity = await InvestmentOpportunity.findById(req.params.id);
		if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
		res.json({ opportunity });
	} catch (err) {
		res.status(400).json({ error: 'Failed to fetch opportunity' });
	}
};

exports.updateOpportunity = async (req, res) => {
	try {
		const opportunity = await InvestmentOpportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
		res.json({ success: true, opportunity });
	} catch (err) {
		res.status(400).json({ error: 'Failed to update opportunity' });
	}
};

exports.deleteOpportunity = async (req, res) => {
	try {
		await InvestmentOpportunity.findByIdAndDelete(req.params.id);
		res.json({ success: true, id: req.params.id });
	} catch (err) {
		res.status(400).json({ error: 'Failed to delete opportunity' });
	}
};
