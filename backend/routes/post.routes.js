const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');

const router = express.Router();

// GET all published posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
    if (!post || post.status === 'removed')
      return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new post with image upload (with detailed logging)
router.post('/', protect, memberOrAdmin, (req, res, next) => {
  // Wrap multer to catch errors
  upload.single('image')(req, res, function(err) {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(400).json({ message: err.message });
    }
    console.log("✅ req.file after multer:", req.file);
    console.log("📝 req.body:", req.body);
    next();
  });
}, async (req, res) => {
  try {
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : '';
    console.log("💾 Saving image filename:", image);

    const post = await Post.create({
      title,
      body,
      image,
      author: req.user.id,
    });

    await post.populate('author', 'name profilePic');
    console.log("✅ Post created:", post._id);
    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Post creation error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update post
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    if (req.body.title) post.title = req.body.title;
    if (req.body.body) post.body = req.body.body;
    if (req.file) post.image = req.file.filename;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE post
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;