const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  adminReply: { type: String, default: '' },        // NEW
  repliedAt: { type: Date },                        // NEW
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contact', messageSchema);