const express = require('express');
const Message = require('../models/Message'); // Ensure this model points to the 'messages' collection
const router = express.Router();

// Test route to verify the router is loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Contact route is working!' });
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new message document
    const newMessage = new Message({
      name,
      email,
      message,
      // adminReply and repliedAt will be added when admin replies
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;