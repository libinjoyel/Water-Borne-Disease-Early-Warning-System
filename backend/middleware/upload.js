const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'incidents');
const MAX_PHOTO_SIZE = parseInt(process.env.MAX_PHOTO_SIZE, 10) || 5 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype];
    cb(null, `incident-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    return cb(null, true);
  }
  const err = new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  err.code = 'INVALID_FILE_TYPE';
  cb(err);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_PHOTO_SIZE },
});

exports.uploadIncidentPhoto = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: `Image file is too large. Maximum size is ${MAX_PHOTO_SIZE / (1024 * 1024)} MB.`,
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'Image upload failed.' });
    }
    next();
  });
};

exports.MAX_PHOTO_SIZE = MAX_PHOTO_SIZE;
