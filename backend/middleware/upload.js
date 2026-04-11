const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Try to load Cloudinary, but don't crash if it fails
let cloudinary;
let CloudinaryStorage;
let useCloudinary = false;

try {
  cloudinary = require('cloudinary').v2;
  const cloudinaryStorage = require('multer-storage-cloudinary');
  // Handle different export styles
  CloudinaryStorage = cloudinaryStorage.CloudinaryStorage || cloudinaryStorage.default?.CloudinaryStorage || cloudinaryStorage;
  useCloudinary = !!CloudinaryStorage;
} catch (err) {
  console.log('Cloudinary not available, using local storage');
}

// Configure Cloudinary if available and credentials exist
if (useCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Choose storage
let storage;
if (useCloudinary && process.env.CLOUDINARY_CLOUD_NAME && CloudinaryStorage) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'blog_images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
  });
} else {
  // Local disk fallback (works on Render but files are temporary)
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;