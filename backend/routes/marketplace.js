const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// List all marketplace items
router.get('/items', marketplaceController.listItems);
// Create a new item
router.post('/items', marketplaceController.createItem);
// Get a single item
router.get('/items/:id', marketplaceController.getItem);
// Update an item
router.put('/items/:id', marketplaceController.updateItem);
// Delete an item
router.delete('/items/:id', marketplaceController.deleteItem);

module.exports = router;
