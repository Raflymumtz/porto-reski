// Multer setup for image uploads -> public/uploads
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${base || 'img'}-${Date.now().toString(36)}${ext}`);
  },
});

const ALLOWED = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

module.exports = { upload, UPLOAD_DIR };
