const mongoose = require('mongoose');
const Message = require('../models/Message'); // adjust path
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const messages = await Message.find({});
    for (const msg of messages) {
      let updated = false;
      // If the old field exists and replies array is empty, migrate it
      if (msg.adminReply && (!msg.replies || msg.replies.length === 0)) {
        msg.replies = [{
          text: msg.adminReply,
          createdAt: msg.repliedAt || new Date()
        }];
        // Optionally delete old fields
        msg.adminReply = undefined;
        msg.repliedAt = undefined;
        updated = true;
      }
      if (updated) await msg.save();
    }
    console.log('Migration completed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();