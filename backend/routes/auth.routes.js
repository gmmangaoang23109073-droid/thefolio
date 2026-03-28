const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');   // Message model
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Helper – generate JWT token with id, email, and role
const generateToken = (id, email, role) => jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  console.log('📝 Register attempt for:', normalizedEmail);
  try {
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      console.log('❌ Email already exists:', normalizedEmail);
      return res.status(400).json({ message: 'Email is already registered' });
    }

    console.log('✅ Creating new user...');
    const user = await User.create({ name, email: normalizedEmail, password });
    console.log('✅ User created with ID:', user._id);

    // Include email and role in token
    const token = generateToken(user._id, user.email, user.role);
    console.log('✅ Token generated');

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
    console.log('✅ Response sent');
  } catch (err) {
    console.error('🔥 Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  console.log('🔐 Login attempt for:', normalizedEmail);
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ User not found for email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      console.log('❌ Account is inactive:', normalizedEmail);
      return res.status(403).json({ message: 'Your account is deactivated. Please contact the admin.' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      console.log('❌ Password mismatch for user:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', normalizedEmail);
    // Include email and role in token
    res.json({
      token: generateToken(user._id, user.email, user.role),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic }
    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by protect middleware (includes id, email, role)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('🔥 /me error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/messages ────────────────────────────────────
// Returns all messages sent by the currently logged‑in user (by email)
router.get('/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('🔥 /messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.file) user.profilePic = req.file.filename;
    await user.save();
    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (err) {
    console.error('🔥 Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/change-password ────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword; // pre-save hook will hash this
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('🔥 Change password error:', err);
    res.status(500).json({ message: err.message });
  }
});
router.get('/messages', protect, async (req, res) => {
  const messages = await Message.find({ email: req.user.email }).sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;