const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// CORS – allow all origins
app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if missing
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/contact', require('./routes/contact.routes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chic-journal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));