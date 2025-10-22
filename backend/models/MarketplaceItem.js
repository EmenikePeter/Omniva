const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  image: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);
