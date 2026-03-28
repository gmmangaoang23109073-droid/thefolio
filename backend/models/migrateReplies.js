const mongoose = require('mongoose');
const Message = require('../models/Message'); // adjust path if needed
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const messages = await Message.find({});
    let updatedCount = 0;

    for (const msg of messages) {
      let updated = false;

      // Case 1: old message with adminReply but no replies array (or empty)
      if (msg.adminReply && (!msg.replies || msg.replies.length === 0)) {
        msg.replies = [{
          text: msg.adminReply,
          sender: 'admin',                     // set sender for the reply
          createdAt: msg.repliedAt || new Date()
        }];
        // Keep the legacy fields for fallback (optional)
        // msg.adminReply = undefined;
        // msg.repliedAt = undefined;
        updated = true;
        updatedCount++;
      }
      // Case 2: message already has a replies array but entries may lack sender
      else if (msg.replies && msg.replies.length > 0) {
        let replyUpdated = false;
        for (let reply of msg.replies) {
          if (!reply.sender) {
            // Assume any reply without a sender is an admin reply (legacy)
            reply.sender = 'admin';
            replyUpdated = true;
          }
        }
        if (replyUpdated) {
          updated = true;
          updatedCount++;
        }
      }

      if (updated) await msg.save();
    }

    console.log(`Migration completed. Updated ${updatedCount} messages.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();