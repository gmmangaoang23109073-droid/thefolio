const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  replies: [replySchema],               // array of admin replies
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);