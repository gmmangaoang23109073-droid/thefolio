// backend/routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Helper function — generates a JWT token that expires in 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase(); // always store lowercase
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

    const token = generateToken(user._id);
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
  const normalizedEmail = email.toLowerCase(); // normalize for lookup
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
    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic }
    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
// Returns the currently logged-in user's data (requires token)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('🔥 /me error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
// Update name, bio, or upload a new profile picture
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const user = await User.findById(req.user._id);
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

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;