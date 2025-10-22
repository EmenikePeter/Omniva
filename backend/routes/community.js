const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/posts', communityController.listPosts);
router.post('/posts', communityController.createPost);
router.get('/posts/:id', communityController.getPost);
router.put('/posts/:id', communityController.updatePost);
router.delete('/posts/:id', communityController.deletePost);

module.exports = router;
