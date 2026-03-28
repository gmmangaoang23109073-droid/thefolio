const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  replies: [replySchema],           // new field
  adminReply: { type: String },     // keep old field for compatibility
  repliedAt: { type: Date },        // keep old field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);