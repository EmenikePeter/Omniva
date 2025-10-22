
const MarketplaceItem = require('../models/MarketplaceItem');

exports.listItems = async (req, res) => {
	try {
		const items = await MarketplaceItem.find().sort({ createdAt: -1 });
		res.json({ items });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch items' });
	}
};

exports.createItem = async (req, res) => {
	try {
		const item = new MarketplaceItem(req.body);
		await item.save();
		res.json({ success: true, item });
	} catch (err) {
		res.status(400).json({ error: 'Failed to create item', details: err.message });
	}
};

exports.getItem = async (req, res) => {
	try {
		const item = await MarketplaceItem.findById(req.params.id);
		if (!item) return res.status(404).json({ error: 'Item not found' });
		res.json({ item });
	} catch (err) {
		res.status(400).json({ error: 'Failed to fetch item' });
	}
};

exports.updateItem = async (req, res) => {
	try {
		const item = await MarketplaceItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!item) return res.status(404).json({ error: 'Item not found' });
		res.json({ success: true, item });
	} catch (err) {
		res.status(400).json({ error: 'Failed to update item' });
	}
};

exports.deleteItem = async (req, res) => {
	try {
		await MarketplaceItem.findByIdAndDelete(req.params.id);
		res.json({ success: true, id: req.params.id });
	} catch (err) {
		res.status(400).json({ error: 'Failed to delete item' });
	}
};
