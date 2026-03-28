const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const adminRoutes = require('./routes/admin.routes');
const commentRoutes = require('./routes/comment.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// --- CORS Configuration ---
// Allow only specific origins (localhost for development, your Vercel app for production)
const allowedOrigins = [
  'http://localhost:3000',           // Local React dev server
  'https://thefolio-rust.vercel.app', // Your live frontend (update with your actual URL)
  // Add other frontend URLs if needed (e.g., preview deployments)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you need cookies/auth headers
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder (create if missing)
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/contact', contactRoutes);

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});
app.get('/api/contact/test-direct', (req, res) => {
  res.json({ message: 'Direct route works' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chic-journal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});