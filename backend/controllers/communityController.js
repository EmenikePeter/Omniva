const CommunityPost = require('../models/CommunityPost');
const crypto = require('crypto');
const SECRET_KEY = process.env.SECRET_KEY?.slice(0, 32) || crypto.randomBytes(32);
function encryptField(value) {
  const algorithm = 'aes-256-cbc';
  const key = SECRET_KEY;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
function decryptField(encrypted) {
  const algorithm = 'aes-256-cbc';
  const key = SECRET_KEY;
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

exports.listPosts = async (req, res) => {
	try {
		const posts = await CommunityPost.find().sort({ createdAt: -1 });
		const decryptedPosts = posts.map(p => ({
			...p.toObject(),
			content: decryptField(p.content)
		}));
		res.json({ posts: decryptedPosts });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch posts' });
	}
};

exports.createPost = async (req, res) => {
	try {
		const post = new CommunityPost({
			author: req.body.author,
			content: encryptField(req.body.content)
		});
		await post.save();
		res.json({ success: true, post });
	} catch (err) {
		res.status(400).json({ error: 'Failed to create post', details: err.message });
	}
};

exports.getPost = async (req, res) => {
	try {
		const post = await CommunityPost.findById(req.params.id);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		res.json({ post });
	} catch (err) {
		res.status(400).json({ error: 'Failed to fetch post' });
	}
};

exports.updatePost = async (req, res) => {
	try {
		const post = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!post) return res.status(404).json({ error: 'Post not found' });
		res.json({ success: true, post });
	} catch (err) {
		res.status(400).json({ error: 'Failed to update post' });
	}
};

exports.deletePost = async (req, res) => {
	try {
		await CommunityPost.findByIdAndDelete(req.params.id);
		res.json({ success: true, id: req.params.id });
	} catch (err) {
		res.status(400).json({ error: 'Failed to delete post' });
	}
};
